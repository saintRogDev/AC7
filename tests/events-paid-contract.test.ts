import assert from "node:assert/strict"
import { test } from "vitest"
import { validateEventsResponse } from "../lib/events-core/response-schema"

const eventId = "734ff330-39c2-48ca-9096-781b173644de"
const otherId = "6905ac58-5fa7-4ccf-85fb-994d11581e37"
const purchaseId = "c9f8edc9-71fb-4f64-bf09-509878d03c67"
const offering = { event_id: eventId, registration_mode: "paid", offering_version: otherId, sales_status: "on_sale", price: { currency: "USD", unit_amount_minor: 2500, tax_behavior: "exclusive" }, max_per_purchase: 6 }

test("paid offering validation preserves free offerings and binds the event", () => {
  const path = `/v1/events/${eventId}/ticket-offering`
  assert.equal(validateEventsResponse(path, "GET", offering), true)
  assert.equal(validateEventsResponse(path, "GET", { event_id: eventId, registration_mode: "free" }), true)
  assert.equal(validateEventsResponse(path, "GET", { ...offering, event_id: otherId }), false)
  assert.equal(validateEventsResponse(path, "GET", { ...offering, max_per_purchase: 0 }), false)
})

test("paid mutations cannot pass the old generic success validator", () => {
  for (const suffix of ["purchases", `purchases/${purchaseId}/checkout`, `purchases/${purchaseId}/status`, `purchases/${purchaseId}/ticket`, `purchases/${purchaseId}/cancel`]) {
    assert.equal(validateEventsResponse(`/v1/events/${eventId}/${suffix}`, "POST", { id: purchaseId }), false)
  }
})

test("staff offering and sales responses reject wrong scope and leaked proofs", () => {
  assert.equal(validateEventsResponse(`/v1/admin/events/${eventId}/ticket-offering`, "GET", offering), true)
  assert.equal(validateEventsResponse(`/v1/admin/events/${otherId}/ticket-offering`, "GET", offering), false)
  const sale = { id: purchaseId, event_id: eventId, buyer_name: "Guest", buyer_email: "guest@example.test", quantity: 2, unit_amount_minor: 2500, currency: "USD", status: "confirmed", subtotal_minor: 5000, tax_minor: 0, total_minor: 5000, holds_capacity: false, created_at: "2026-11-12T12:00:00Z", reconciliation_failures: 0 }
  const path = `/v1/admin/events/${eventId}/purchases`
  assert.equal(validateEventsResponse(path, "GET", { purchases: [sale], next_cursor: null }), true)
  assert.equal(validateEventsResponse(path, "GET", { purchases: [{ ...sale, event_id: otherId }], next_cursor: null }), false)
  assert.equal(validateEventsResponse(path, "GET", { purchases: [{ ...sale, access_token: "a".repeat(43) }], next_cursor: null }), false)
})

test("group tickets require distinct admissions and tokens within the same purchase", () => {
  const path = `/v1/events/${eventId}/purchases/${purchaseId}/ticket`
  const ticket = { event_id: eventId, purchase_id: purchaseId, registration_id: eventId, token: "a".repeat(43) }
  const second = { ...ticket, registration_id: otherId, token: "b".repeat(43) }
  const data = { event_id: eventId, purchase_id: purchaseId, tickets: [ticket, second] }
  assert.equal(validateEventsResponse(path, "POST", data), true)
  assert.equal(validateEventsResponse(path, "POST", { ...data, tickets: [ticket, ticket] }), false)
  assert.equal(validateEventsResponse(path, "POST", { ...data, tickets: [ticket, { ...second, purchase_id: otherId }] }), false)
})
