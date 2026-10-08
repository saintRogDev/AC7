import { afterEach, expect, it, vi } from "vitest"
const send = vi.hoisted(() => vi.fn())
vi.mock("@east-saint/staff-invitations-client/server", () => ({ sendInvitationToEstl: send }))
import { sendInvitationToEstl } from "./staff-invitation-transport"
afterEach(() => { vi.unstubAllEnvs(); send.mockReset() })
const input = { email: "example@example.test", name: "", role: "reviewer" as const }
it("denies production org on preview before shared transport", async () => {
  vi.stubEnv("VERCEL_ENV", "preview")
  expect(await sendInvitationToEstl(input, "token", "ac7")).toEqual({ status: "forbidden" }); expect(send).not.toHaveBeenCalled()
})
it("pins credential variable, API origin and expected environment", async () => {
  vi.stubEnv("VERCEL_ENV", "preview"); send.mockResolvedValue({ status: "not_sent" })
  await sendInvitationToEstl(input, "token", "ac7-sandbox")
  expect(send).toHaveBeenCalledWith(input, "token", "ac7-sandbox", process.env, { credentialVariable: "EAST_SAINT_SITE_KEY", expectedEnvironment: "preview", approvedApiOrigin: "https://east-saint-platform-api.vercel.app" })
})
