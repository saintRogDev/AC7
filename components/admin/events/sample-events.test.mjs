import assert from "node:assert/strict"
import { test } from "node:test"
import { evaluateSampleCheckIn } from "./sample-events.ts"

test("validate-only leaves the supplied attendance ledger unchanged", () => {
  const ledger = new Set()
  assert.equal(evaluateSampleCheckIn({ reference: "DEMO-ALEX", validateOnly: true }, ledger).status, "valid")
  assert.equal(ledger.size, 0)
})

test("repeat scans are duplicates after one sample check-in", () => {
  const ledger = new Set()
  const request = { reference: "DEMO-ALEX", validateOnly: false }
  assert.equal(evaluateSampleCheckIn(request, ledger).status, "checked-in")
  ledger.add(request.reference)
  assert.equal(evaluateSampleCheckIn(request, ledger).status, "duplicate")
  assert.equal(evaluateSampleCheckIn({ ...request, validateOnly: true }, ledger).status, "duplicate")
  assert.equal(ledger.size, 1)
})

test("untrusted scan content is an inert exact-match label", () => {
  const ledger = new Set()
  for (const reference of ["", "https://example.com/DEMO-ALEX", "<script>alert(1)</script>", "DEMO-ALEX\nDEMO-JORDAN"]) {
    assert.equal(evaluateSampleCheckIn({ reference, validateOnly: false }, ledger).status, "invalid")
  }
  assert.equal(evaluateSampleCheckIn({ reference: " DEMO-ALEX\r\n", validateOnly: true }, ledger).status, "valid")
  assert.equal(ledger.size, 0)
})

test("wrong-event and revoked sample references never admit", () => {
  assert.equal(evaluateSampleCheckIn({ reference: "DEMO-OTHER", validateOnly: false }, new Set()).status, "wrong-event")
  assert.equal(evaluateSampleCheckIn({ reference: "DEMO-REVOKED", validateOnly: false }, new Set()).status, "revoked")
})
