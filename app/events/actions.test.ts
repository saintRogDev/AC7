import { afterEach, expect, it, vi } from "vitest"
const calls = vi.hoisted(() => ({ listPublishedEvents: vi.fn(), getPublishedEvent: vi.fn(), requestRegistration: vi.fn(), confirmRegistration: vi.fn() }))
vi.mock("@/lib/estl-events-adapter", () => calls)
vi.mock("@/lib/estl-visitor-source", () => ({ currentVisitorSourceIp: vi.fn().mockResolvedValue(null) }))
import { listPublishedEventsAction, getEventAction, requestRegistrationAction, confirmRegistrationAction } from "./actions"
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks() })
it("blocks every public action while the rollout flag is off", async () => {
 vi.stubEnv("ESTL_EVENTS_PUBLIC_ENABLED", "false")
 const results = await Promise.all([listPublishedEventsAction(null), getEventAction("event"), requestRegistrationAction({ eventId: "event", name: "Test", email: "test@example.com", idempotency_key: "key" }), confirmRegistrationAction({ eventId: "event", verification_token: "proof" })])
 for (const result of results) expect(result).toMatchObject({ error: { code: "EVENT_NOT_FOUND" } })
 for (const call of Object.values(calls)) expect(call).not.toHaveBeenCalled()
})
it("does not send email when the source address is unavailable", async () => {
 vi.stubEnv("ESTL_EVENTS_PUBLIC_ENABLED", "true")
 expect(await requestRegistrationAction({ eventId: "event", name: "Test", email: "test@example.com", idempotency_key: "key" })).toMatchObject({ error: { code: "UNAVAILABLE" } })
 expect(calls.requestRegistration).not.toHaveBeenCalled()
})
