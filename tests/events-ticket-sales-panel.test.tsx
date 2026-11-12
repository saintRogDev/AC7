import { beforeEach, afterEach, test } from "vitest"
import assert from "node:assert/strict"
import { JSDOM } from "jsdom"
import React, { act } from "react"
import type { Root } from "react-dom/client"
import type { EventCore } from "../lib/events-core/types"
import type { TicketManagementActions } from "../components/events-core/admin/ticket-sales-panel"

let dom: JSDOM, root: Root, container: HTMLDivElement
let previous: Map<string, PropertyDescriptor | undefined>
const eventId = "734ff330-39c2-48ca-9096-781b173644de"
const version = "6905ac58-5fa7-4ccf-85fb-994d11581e37"
const event = { id: eventId, title: "Sandbox event", status: "draft" } as EventCore
const offering = { event_id: eventId, registration_mode: "paid", offering_version: version, sales_status: "paused", price: { currency: "USD", unit_amount_minor: 2500, tax_behavior: "exclusive" }, max_per_purchase: 6 }
const defaults: TicketManagementActions = { offering: async () => ({ data: offering }), sales: async () => ({ data: { purchases: [], next_cursor: null } }), configure: async () => ({ data: offering }) }

beforeEach(async () => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://preview.example.test" })
  previous = new Map()
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
  container = document.createElement("div"); document.body.append(container)
  const { createRoot } = await import("react-dom/client"); root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount()); dom.window.close()
  for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) }
})
async function mount(actions: TicketManagementActions, value = event) {
  const { TicketSalesPanel } = await import("../components/events-core/admin/ticket-sales-panel")
  await act(async () => root.render(<TicketSalesPanel event={value} actions={actions} />))
}
async function submit() {
  await act(async () => { container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })) })
}

test("price retries preserve intent; changed price gets a new key without changing quantity or version", async () => {
  const calls: { eventId: string; body: { price: { unit_amount_minor: number }; max_per_purchase: number; expected_version: string; idempotency_key: string } }[] = []
  await mount({ ...defaults, configure: async input => { calls.push(input as typeof calls[number]); return { error: { code: "UNAVAILABLE", message: "Retry this request" } } } })
  await submit(); await submit()
  assert.equal(calls.length, 2); assert.deepEqual(calls[0], calls[1])
  assert.equal(calls[0].body.max_per_purchase, 6); assert.equal(calls[0].body.expected_version, version)
  const price = container.querySelector<HTMLInputElement>('input[name="price"]')!
  price.value = "30.00"
  await submit()
  assert.equal(calls[2].body.price.unit_amount_minor, 3000)
  assert.notEqual(calls[2].body.idempotency_key, calls[0].body.idempotency_key)
})

test("a saved price replaces the displayed offering and announces persistence", async () => {
  await mount({ ...defaults, configure: async () => ({ data: { ...offering, offering_version: eventId, price: { ...offering.price, unit_amount_minor: 3000 } } }) })
  await submit()
  assert.equal(container.querySelector<HTMLInputElement>('input[name="price"]')!.value, "30.00")
  assert.match(container.textContent!, /Ticket settings saved/)
})

test("a mismatched event response never enables editing", async () => {
  await mount({ ...defaults, offering: async () => ({ data: { ...offering, event_id: version } }) })
  assert.equal(container.querySelector("form"), null)
  assert.match(container.querySelector('[role="alert"]')!.textContent!, /could not be loaded/)
})

test("a published free event must return to draft before paid conversion", async () => {
  await mount({ ...defaults, offering: async () => ({ data: { event_id: eventId, registration_mode: "free" } }) }, { ...event, status: "published" })
  assert.equal(container.querySelector("fieldset")!.disabled, true)
  assert.match(container.textContent!, /first save it as a draft/)
})
