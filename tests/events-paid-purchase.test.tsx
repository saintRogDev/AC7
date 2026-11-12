import { beforeEach, afterEach, test } from "vitest"
import assert from "node:assert/strict"
import { JSDOM } from "jsdom"
import React, { act } from "react"
import type { Root } from "react-dom/client"
import type { EventOffering, PaidEventPurchase, PaidEventsPublicAdapter } from "@east-saint/events-client/paid"
import type { EventCore } from "../lib/events-core/types"
import { rememberPurchase, recallPurchase } from "../lib/events-core/paid-session"

let dom: JSDOM, root: Root, container: HTMLDivElement
let previous: Map<string, PropertyDescriptor | undefined>
const eventId = "734ff330-39c2-48ca-9096-781b173644de", purchaseId = "c9f8edc9-71fb-4f64-bf09-509878d03c67", version = "6905ac58-5fa7-4ccf-85fb-994d11581e37"
const offering = { event_id: eventId, registration_mode: "paid", offering_version: version, sales_status: "on_sale", price: { currency: "USD", unit_amount_minor: 2500, tax_behavior: "exclusive" }, max_per_purchase: 6 } as const
const basePurchase = { id: purchaseId, event_id: eventId, offering_version: version, price: { ...offering.price, quantity: 2 }, created_at: "2026-11-12T12:00:00Z", updated_at: "2026-11-12T12:01:00Z", checkout: null }
const reserved: PaidEventPurchase = { ...basePurchase, status: "reserved", registration_ids: [], admission: "unissued", settlement: null, hold_expires_at: "2026-11-12T12:30:00Z" }
const confirmed: PaidEventPurchase = { ...basePurchase, status: "confirmed", registration_ids: [eventId, version], admission: "valid", settlement: { subtotal_minor: 5000, tax_minor: 0, total_minor: 5000 }, hold_expires_at: null }
const ticketData = { event_id: eventId, purchase_id: purchaseId, tickets: [{ event_id: eventId, purchase_id: purchaseId, registration_id: eventId, token: "a".repeat(43) }, { event_id: eventId, purchase_id: purchaseId, registration_id: version, token: "b".repeat(43) }] }
const proof = "p".repeat(43)
const defaults: PaidEventsPublicAdapter = {
  getOffering: async () => ({ data: offering }), requestVerification: async () => ({ data: { status: "verification_required" } }),
  createPurchase: async () => ({ data: { purchase: reserved, access_token: proof } }), startCheckout: async () => ({ data: { ...reserved, status: "checkout_pending" } }),
  getPurchase: async () => ({ data: reserved }), getTicket: async () => ({ data: ticketData }),
  requestRecovery: async () => ({ data: { status: "verification_required" } }), recoverPurchase: async () => ({ data: { purchase: reserved, access_token: proof } }),
  cancelPurchase: async () => ({ data: { ...reserved, status: "cancelled", hold_expires_at: null } }),
}
beforeEach(async () => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://preview.example.test" })
  previous = new Map()
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, sessionStorage: dom.window.sessionStorage, FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
  Object.defineProperty(document, "hidden", { configurable: true, value: false })
  container = document.createElement("div"); document.body.append(container)
  const { createRoot } = await import("react-dom/client"); root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount()); dom.window.close()
  for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) }
})
async function mount(adapter = defaults, recover = false) {
  const { PaidTickets } = await import("../components/events-core/public/paid-tickets")
  await act(async () => root.render(<PaidTickets eventId={eventId} purchaseId={recover ? purchaseId : undefined} adapter={adapter} offering={recover ? null : offering} salesAvailable eventHref={`/events/${eventId}`} />))
}
async function submit() { await act(async () => { container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })) }) }
async function click(text: string) { const button = Array.from(container.querySelectorAll("button")).find(button => button.textContent === text); assert.ok(button, `missing button ${text}`); await act(async () => button.click()) }
function fill(name: string, value: string) { const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!; assert.ok(input, `missing field ${name}`); input.value = value }

test("quantity survives verification and only authoritative payment issues two distinct tickets", async () => {
  const reservations: unknown[] = []; let paid = false, ticketReads = 0
  await mount({ ...defaults, createPurchase: async input => { reservations.push(input); return { data: { purchase: reserved, access_token: proof } } }, getPurchase: async () => ({ data: paid ? confirmed : reserved }), getTicket: async () => { ticketReads++; return { data: ticketData } } })
  const select = container.querySelector("select")!
  await act(async () => { select.value = "2"; select.dispatchEvent(new dom.window.Event("change", { bubbles: true })) })
  fill("name", "Test Buyer"); fill("email", "buyer@example.test"); await submit()
  fill("code", "v".repeat(43)); await submit()
  assert.equal((reservations[0] as { body: { quantity: number } }).body.quantity, 2)
  assert.match(container.textContent!, /Payment|held/); assert.equal(ticketReads, 0); assert.equal(container.querySelectorAll("article").length, 0)
  paid = true; await click("Refresh status")
  assert.equal(ticketReads, 1); assert.equal(container.querySelectorAll("article").length, 2)
  assert.deepEqual(Array.from(container.querySelectorAll("code")).map(node => node.textContent), ["a".repeat(43), "b".repeat(43)])
  const stored = sessionStorage.getItem(`estl-ticket:v1:${eventId}:${purchaseId}`)!
  assert.ok(stored.includes(proof)); assert.ok(!stored.includes("confirmed")); assert.ok(!window.location.href.includes(proof))
})

test("checkout retry preserves the same command after an uncertain result", async () => {
  const keys: string[] = []
  rememberPurchase(eventId, { purchaseId, token: proof, checkoutKey: version })
  await mount({ ...defaults, startCheckout: async input => { keys.push(input.body.idempotency_key); return { error: { code: "UNAVAILABLE", message: "Please retry" } } } }, true)
  await click("Continue to secure payment"); await click("Continue to secure payment")
  assert.deepEqual(keys, [version, version]); assert.equal(container.querySelectorAll("article").length, 0)
})

test("recovery does not create a new checkout command for an existing uncertain payment", async () => {
  let recoveryRequest: unknown, checkoutCalls = 0
  const pending = { ...reserved, status: "checkout_pending" as const }
  await mount({ ...defaults, requestRecovery: async input => { recoveryRequest = input; return { data: { status: "verification_required" } } }, recoverPurchase: async () => ({ data: { purchase: pending, access_token: proof } }), getPurchase: async () => ({ data: pending }), startCheckout: async () => { checkoutCalls++; return { data: pending } } }, true)
  fill("email", "buyer@example.test"); await submit()
  assert.equal((recoveryRequest as { body: { purchase_id: string } }).body.purchase_id, purchaseId)
  fill("code", "r".repeat(43)); await submit()
  assert.match(container.textContent!, /checking your checkout/)
  assert.ok(!Array.from(container.querySelectorAll("button")).some(button => /secure payment|Retry the same checkout/.test(button.textContent!)))
  assert.equal(checkoutCalls, 0)
})

test("a partial ticket collection is withheld even after confirmed payment", async () => {
  rememberPurchase(eventId, { purchaseId, token: proof })
  await mount({ ...defaults, getPurchase: async () => ({ data: confirmed }), getTicket: async () => ({ data: { ...ticketData, tickets: ticketData.tickets.slice(0, 1) } }) }, true)
  assert.equal(container.querySelectorAll("article").length, 0)
  assert.ok(container.querySelector('[role="alert"]'))
})

test("only a verified free offering can render the old RSVP flow", async () => {
  const { PaidRegistration } = await import("../components/events-core/public/paid-tickets")
  const event = { id: eventId, status: "published", ends_at: "2099-01-01T00:00:00Z" } as EventCore
  await act(async () => root.render(<PaidRegistration event={event} adapter={{ ...defaults, getOffering: async () => ({ error: { code: "UNAVAILABLE", message: "Unavailable" } }) }} freeRegistration={<p>Original RSVP</p>} eventHref="/events" />))
  assert.ok(!container.textContent!.includes("Original RSVP")); assert.match(container.textContent!, /Recover your tickets/)
  await act(async () => root.render(<PaidRegistration key="free" event={event} adapter={{ ...defaults, getOffering: async () => ({ data: { event_id: eventId, registration_mode: "free" } as EventOffering }) }} freeRegistration={<p>Original RSVP</p>} eventHref="/events" />))
  assert.match(container.textContent!, /Original RSVP/)
})

test("tab credentials expire and reject malformed tokens without trusting cached status", () => {
  const storageKey = `estl-ticket:v1:${eventId}:${purchaseId}`
  for (const value of [{ purchaseId, token: [proof], savedAt: Date.now() }, { purchaseId, token: proof, savedAt: Date.now() - 86_400_001 }, { purchaseId, token: proof, savedAt: Date.now() + 86_400_000 }]) {
    sessionStorage.setItem(storageKey, JSON.stringify(value)); assert.equal(recallPurchase(eventId, purchaseId), null)
  }
  sessionStorage.setItem(storageKey, JSON.stringify({ purchaseId, token: proof, savedAt: Date.now(), purchase: confirmed }))
  assert.deepEqual(recallPurchase(eventId, purchaseId), { purchaseId, token: proof })
})

 test("disabled paid sales never fall back to free RSVP, while free events still register", async () => {
  const { PaidRegistration } = await import("../components/events-core/public/paid-tickets")
  const event = { id: eventId, status: "published", ends_at: "2099-01-01T00:00:00Z" } as EventCore
  await act(async () => root.render(<PaidRegistration event={event} adapter={defaults} salesEnabled={false} freeRegistration={<p>Original RSVP</p>} eventHref="/events" />))
  assert.ok(!container.textContent!.includes("Original RSVP"))
  assert.equal(container.querySelector('input[name="email"]'), null)
  assert.match(container.textContent!, /Recover your tickets/)
  await act(async () => root.render(<PaidRegistration key="disabled-free" event={event} adapter={{ ...defaults, getOffering: async () => ({ data: { event_id: eventId, registration_mode: "free" } as EventOffering }) }} salesEnabled={false} freeRegistration={<p>Original RSVP</p>} eventHref="/events" />))
  assert.match(container.textContent!, /Original RSVP/)
})
