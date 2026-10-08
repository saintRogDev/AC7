import assert from "node:assert/strict"
import { afterEach, beforeEach, test, vi } from "vitest"
import { JSDOM } from "jsdom"
import { act } from "react"
import type { Root } from "react-dom/client"
import type { EventsPublicAdapter } from "../lib/events-core/adapter"
import type { EstlResult, EventCore, RegistrationAck } from "../lib/events-core/types"

let dom: JSDOM
let root: Root
let container: HTMLDivElement
let previous: Map<string, PropertyDescriptor | undefined>

const event: EventCore = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Community circle",
  slug: "community-circle",
  description: null,
  image_url: null,
  location: null,
  starts_at: "2099-01-01T10:00:00Z",
  ends_at: "2099-01-01T11:00:00Z",
  capacity: 5,
  status: "published",
}

beforeEach(async () => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://preview.example.com" })
  previous = new Map()
  // `self` is what next/link's idle-callback shim reaches for outside a browser.
  for (const [key, value] of Object.entries({ window: dom.window, self: dom.window, document: dom.window.document,
    navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
  container = document.createElement("div")
  document.body.append(container)
  const { createRoot } = await import("react-dom/client")
  root = createRoot(container)
})

afterEach(async () => {
  vi.useRealTimers()
  await act(async () => root.unmount())
  dom.window.close()
  for (const [key, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
})

function type(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value")!.set!.call(input, value)
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }))
}

/** Mounts the public detail view with a registration outcome sequence; returns the call count. */
async function mount(outcomes: EstlResult<RegistrationAck>[], confirmRegistration?: EventsPublicAdapter["confirmRegistration"]) {
  const { EventDetail } = await import("../components/events-core/public/event-detail")
  let calls = 0
  const adapter = {
    listEvents: async () => ({ data: { events: [event], next_cursor: null } }),
    getEvent: async () => ({ data: event }),
    createRegistration: async () => outcomes[calls++],
    confirmRegistration: confirmRegistration ?? (async () => ({ error: { code: "UNAVAILABLE", message: "unused" } })),
  } as EventsPublicAdapter
  await act(async () => root.render(<EventDetail adapter={adapter} eventId={event.id} reloadKey={0} backHref="/" />))
  await act(async () => {
    const [name, email] = Array.from(container.querySelectorAll<HTMLInputElement>("form input"))
    type(name, "Jordan Rivera")
    type(email, "guest@example.com")
  })
  return () => calls
}

async function submit() {
  await act(async () => {
    container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }))
  })
}

test("a rate-limited request shows the wait, never the check-inbox screen, and offers no instant retry", async () => {
  const calls = await mount([
    { error: { code: "RATE_LIMITED", message: "Too many requests from your network right now. Try again in about 13 minutes.", retryAfterSeconds: 742 } },
  ])
  await submit()
  assert.equal(calls(), 1)
  const alert = container.querySelector('[role="alert"]')
  assert.ok(alert, "the limit is surfaced as an alert")
  assert.match(alert.textContent!, /Try again in about 13 minutes/)
  assert.doesNotMatch(alert.textContent!, /RATE_LIMITED/)
  assert.doesNotMatch(container.textContent!, /Check .* for your verification code/)
  assert.equal(alert.querySelector("button"), null, "no Try again button for a limited network")
  // The form stays available, so the visitor can come back after the wait.
  assert.ok(container.querySelector("form"))
})

test("other failures keep the immediate retry affordance", async () => {
  await mount([
    { error: { code: "UNAVAILABLE", message: "Events are temporarily unavailable. Try again shortly." } },
    { data: { status: "verification_required" } },
  ])
  await submit()
  const alert = container.querySelector('[role="alert"]')!
  assert.match(alert.textContent!, /temporarily unavailable/)
  const retry = alert.querySelector("button")
  assert.ok(retry, "a transient failure offers Try again")
  await act(async () => { retry.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })) })
  assert.match(container.textContent!, /verification code/)
})

test("a rate-limited resend keeps the visitor on the code screen with the wait message", async () => {
  // The resend cooldown is a chain of one-second timeouts; drive it with fake timers.
  vi.useFakeTimers({ toFake: ["setTimeout"] })
  const calls = await mount([
    { data: { status: "verification_required" } },
    { error: { code: "RATE_LIMITED", message: "Too many requests from your network right now. Please wait before trying again." } },
  ])
  await submit()
  assert.match(container.textContent!, /verification code/)
  const resendButton = () => Array.from(container.querySelectorAll("button")).find((button) => /Resend email/.test(button.textContent ?? ""))!
  assert.ok(resendButton().disabled, "resend waits for its cooldown")
  for (let second = 0; second < 30; second++) await act(async () => { vi.advanceTimersByTime(1000) })
  assert.equal(resendButton().disabled, false)
  await act(async () => { resendButton().dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })) })
  assert.equal(calls(), 2)
  const alert = container.querySelector('[role="alert"]')!
  assert.match(alert.textContent!, /Too many requests from your network/)
  assert.equal(alert.querySelector("button"), null)
  // Still on the code screen: the visitor keeps the code they may already have received.
  assert.match(container.textContent!, /verification code/)
  assert.ok(container.querySelector('input[placeholder="Paste the code from your email"]'))
})


test("confirmation replay explains saved-ticket recovery without promising an emailed ticket", async () => {
  await mount([{ data: { status: "verification_required" } }], async () => ({ data: { id: event.id, replayed: true, token: null } }))
  await submit()
  await act(async () => { type(container.querySelector<HTMLInputElement>('input[placeholder="Paste the code from your email"]')!, "p".repeat(43)) })
  await act(async () => { Array.from(container.querySelectorAll("button")).find(button => /Confirm/.test(button.textContent ?? ""))!.click() })
  assert.match(container.textContent!, /Already confirmed/)
  assert.match(container.textContent!, /Tickets are not emailed/)
  assert.match(container.textContent!, /staff can look up your registration/)
  assert.doesNotMatch(container.textContent!, /check the confirmation email/)
})
