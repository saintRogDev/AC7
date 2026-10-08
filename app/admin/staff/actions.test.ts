import { beforeEach, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({ requireAc7Staff: vi.fn(), createClient: vi.fn(), send: vi.fn() }))
vi.mock("@/lib/admin-auth", () => ({ requireAc7Staff: mocks.requireAc7Staff }))
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }))
vi.mock("@/lib/staff-invitation-transport", () => ({ sendInvitationToEstl: mocks.send }))
import { sendStaffInvitation } from "./actions"
const input = { name: "Example", email: "example@example.test", role: "reviewer" }
beforeEach(() => { vi.resetAllMocks(); mocks.requireAc7Staff.mockResolvedValue({ role: "admin", userId: "actor", orgSlug: "ac7-sandbox" }); mocks.createClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: "actor" } } }), getSession: async () => ({ data: { session: { user: { id: "actor" }, access_token: "token" } } }) } }); mocks.send.mockResolvedValue({ status: "sent", email: input.email }) })
it.each(["reviewer", "manager"])("denies %s without auth transport", async role => {
  mocks.requireAc7Staff.mockResolvedValue({ role, userId: "actor", orgSlug: "ac7-sandbox" })
  expect(await sendStaffInvitation(input)).toEqual({ status: "forbidden" })
  expect(mocks.createClient).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled()
})
it("rejects mismatched session actor", async () => {
  mocks.createClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: "other" } } }), getSession: async () => ({ data: { session: { user: { id: "actor" }, access_token: "token" } } }) } })
  expect(await sendStaffInvitation(input)).toEqual({ status: "auth_required" }); expect(mocks.send).not.toHaveBeenCalled()
})
it("passes verified actor context to shared transport", async () => {
  expect(await sendStaffInvitation(input)).toEqual({ status: "sent", email: input.email })
  expect(mocks.send).toHaveBeenCalledWith(input, "token", "ac7-sandbox")
})
it("preserves uncertain sends and rejects malformed role", async () => {
  mocks.send.mockResolvedValue({ status: "unavailable" }); expect(await sendStaffInvitation(input)).toEqual({ status: "unavailable" })
  mocks.send.mockClear(); expect(await sendStaffInvitation({ ...input, role: "owner" })).toEqual({ status: "invalid" }); expect(mocks.send).not.toHaveBeenCalled()
})
