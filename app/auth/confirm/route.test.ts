import { beforeEach, expect, it, vi } from "vitest"
const verifyOtp = vi.hoisted(() => vi.fn())
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { verifyOtp } }) }))
import { GET, POST } from "./route"
const token = "a".repeat(64)
const request = (origin = "https://ac7.example") => new Request("https://ac7.example/auth/confirm", { method: "POST", headers: { origin }, body: new URLSearchParams({ token_hash: token, type: "invite" }) })
beforeEach(() => vi.resetAllMocks())
it("GET renders AC7 confirmation without consuming the token", async () => {
  const response = await GET(new Request(`https://ac7.example/auth/confirm?token_hash=${token}&type=invite`))
  expect(response.status).toBe(200); expect(await response.text()).toContain("AC7 Foundation"); expect(verifyOtp).not.toHaveBeenCalled()
})
it("rejects cross-origin confirmation before verifyOtp", async () => {
  expect((await POST(request("https://other.example"))).status).toBe(403); expect(verifyOtp).not.toHaveBeenCalled()
})
it("confirms only on explicit same-origin POST", async () => {
  verifyOtp.mockResolvedValue({ error: null })
  const response = await POST(request())
  expect(response.headers.get("location")).toBe("https://ac7.example/accept-invite")
  expect(verifyOtp).toHaveBeenCalledWith({ token_hash: token, type: "invite" })
})
it("keeps retry possible when verification is unavailable", async () => {
  verifyOtp.mockRejectedValue(new Error("transport"))
  const response = await POST(request())
  expect(response.status).toBe(503); expect(await response.text()).toContain("Retry")
})
it("rejects expired or replayed invitations without granting access", async () => {
  verifyOtp.mockResolvedValue({ error: { __isAuthError: true, status: 403, code: "otp_expired", message: "Expired" } })
  const response = await POST(request())
  expect(response.headers.get("location")).toBe("https://ac7.example/login?reason=invalid_invite")
})
