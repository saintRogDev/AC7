import assert from "node:assert/strict"
import { test } from "vitest"

import { authorizeEventsStaff, isEventsStaffRole, withEventsStaff } from "./estl-events-staff-core.ts"

const STAFF = { role: "manager", userId: "user-1", orgSlug: "ac7-sandbox" }

const goodSession = async () => ({
  userId: "user-1",
  sessionUserId: "user-1",
  accessToken: "token-1",
})

const goodProbe = async () => ({
  data: { organization: { slug: "ac7-sandbox" }, staff: { role: "manager" } },
})

test("reviewers are staff for Forms but never for Events", () => {
  assert.equal(isEventsStaffRole("admin"), true)
  assert.equal(isEventsStaffRole("manager"), true)
  assert.equal(isEventsStaffRole("reviewer"), false)
  assert.equal(isEventsStaffRole("user"), false)
})

test("a reviewer is refused before any token is read", async () => {
  const result = await authorizeEventsStaff(
    { ...STAFF, role: "reviewer" },
    async () => assert.fail("must not read a session"),
    async () => assert.fail("must not probe ESTL"),
  )
  assert.ok("error" in result)
  assert.equal(result.error.code, "FORBIDDEN")
})

test("authorizes a manager whose session and ESTL view agree", async () => {
  const result = await authorizeEventsStaff(STAFF, goodSession, goodProbe)
  assert.ok("data" in result)
  assert.equal(result.data.token, "token-1")
})

test("a session that disagrees with the staff context is rejected", async () => {
  const sessions = [
    { userId: null, sessionUserId: "user-1", accessToken: "token-1" },
    { userId: "user-1", sessionUserId: "someone-else", accessToken: "token-1" },
    { userId: "someone-else", sessionUserId: "someone-else", accessToken: "token-1" },
    { userId: "user-1", sessionUserId: "user-1", accessToken: null },
  ]
  for (const session of sessions) {
    const result = await authorizeEventsStaff(STAFF, async () => session, async () =>
      assert.fail("must not probe ESTL with an unverified session"),
    )
    assert.ok("error" in result)
    assert.equal(result.error.code, "UNAUTHORIZED")
  }
})

test("a site credential resolving to another tenant is refused", async () => {
  const result = await authorizeEventsStaff(STAFF, goodSession, async () => ({
    data: { organization: { slug: "some-other-tenant" }, staff: { role: "admin" } },
  }))
  assert.ok("error" in result)
  assert.equal(result.error.code, "FORBIDDEN")
})

test("ESTL's own role verdict is authoritative, not AC7's", async () => {
  for (const role of ["reviewer", "user", undefined]) {
    const result = await authorizeEventsStaff(STAFF, goodSession, async () => ({
      data: { organization: { slug: STAFF.orgSlug }, staff: { role } },
    }))
    assert.ok("error" in result, `role ${role} must not authorize`)
    assert.equal(result.error.code, "FORBIDDEN")
  }
})

test("a probe failure is propagated rather than treated as authorized", async () => {
  const result = await authorizeEventsStaff(STAFF, goodSession, async () => ({
    error: { code: "UNAVAILABLE", message: "down" },
  }))
  assert.ok("error" in result)
  assert.equal(result.error.code, "UNAVAILABLE")
})

test("a thrown session read is unavailable, not authorized", async () => {
  const result = await authorizeEventsStaff(STAFF, async () => {
    throw new Error("cookie store unavailable")
  }, async () => assert.fail("must not probe ESTL"))
  assert.ok("error" in result)
  assert.equal(result.error.code, "UNAVAILABLE")
})

test("withEventsStaff runs the call only after authorization succeeds", async () => {
  let called = 0
  const ok = await withEventsStaff(STAFF, goodSession, goodProbe, async (token) => {
    called += 1
    assert.equal(token, "token-1")
    return { data: { id: "event-1" } }
  })
  assert.ok("data" in ok)
  assert.equal(called, 1)

  const denied = await withEventsStaff({ ...STAFF, role: "reviewer" }, goodSession, goodProbe, async () => {
    called += 1
    return { data: { id: "event-1" } }
  })
  assert.ok("error" in denied)
  assert.equal(called, 1, "the call must not run for an unauthorized role")
})
