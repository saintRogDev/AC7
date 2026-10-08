import { afterEach, expect, it, vi } from "vitest"
const guard = vi.hoisted(() => ({ requireEventsStaff: vi.fn(), callAsEventsStaff: vi.fn() }))
vi.mock("@/lib/estl-events-staff", () => guard)
vi.mock("@/lib/estl-events-adapter", () => ({ checkIn: vi.fn(), createEvent: vi.fn(), listAllEvents: vi.fn(), listAttendees: vi.fn(), registerGuest: vi.fn(), updateEvent: vi.fn() }))
import { checkInAction, createEventAction, listEventsAction, listAttendeesAction, registerGuestAction, updateEventAction } from "./actions"
import type { EventInput } from "@/lib/events-core/types"
afterEach(() => vi.clearAllMocks())
const event: EventInput = { title: "Test", slug: "test", description: null, image_url: null, location: null, capacity: null, status: "draft", starts_at: "2099-01-01T10:00:00Z", ends_at: "2099-01-01T11:00:00Z" }
it.each([
 ["list", () => listEventsAction(null)],
 ["create", () => createEventAction(event)],
 ["update", () => updateEventAction("event", event)],
 ["attendees", () => listAttendeesAction("event", null)],
 ["register", () => registerGuestAction({ eventId: "event", name: "Test", email: "test@example.com", idempotency_key: "key" })],
 ["check-in", () => checkInAction({ eventId: "event", token: "ticket" })],
] as const)("denies %s before any transport when the staff guard rejects", async (_name, call) => {
 guard.requireEventsStaff.mockRejectedValue(new Error("forbidden"))
 await expect(call()).rejects.toThrow("forbidden")
 expect(guard.callAsEventsStaff).not.toHaveBeenCalled()
})
