import { beforeEach, expect, it, vi } from "vitest"
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getSession: vi.fn(), getClaims: vi.fn() }))
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: mocks }) }))
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`) } }))
vi.mock("./accept-invite-form", () => ({ AcceptInviteForm: () => null }))
import AcceptInvitePage from "./page"
beforeEach(() => {
  vi.resetAllMocks()
  mocks.getUser.mockResolvedValue({ data: { user: { id: "actor" } }, error: null })
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "actor" }, access_token: "token" } }, error: null })
  mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "actor", amr: [{ method: "otp", timestamp: 1 }] } }, error: null })
})
it("renders password setup only after authenticated actor and verified invitation claims", async () => {
  expect(await AcceptInvitePage()).toBeTruthy(); expect(mocks.getClaims).toHaveBeenCalledWith("token")
})
it("rejects mismatched getUser/session actor", async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { id: "other" } }, error: null })
  await expect(AcceptInvitePage()).rejects.toThrow("invalid_invite"); expect(mocks.getClaims).not.toHaveBeenCalled()
})
it("does not treat password sessions or mismatched verified claims as invitation setup", async () => {
  mocks.getClaims.mockResolvedValueOnce({ data: { claims: { sub: "actor", amr: [{ method: "password", timestamp: 2 }] } }, error: null }).mockResolvedValueOnce({ data: { claims: { sub: "other", amr: [{ method: "otp", timestamp: 2 }] } }, error: null })
  await expect(AcceptInvitePage()).rejects.toThrow("redirect:/admin")
  await expect(AcceptInvitePage()).rejects.toThrow("redirect:/admin")
})
