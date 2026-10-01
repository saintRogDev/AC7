export const sampleEvent = {
  id: "sample-community-day",
  title: "A day of service, a lasting legacy",
  date: "October 24, 2026 · 10:00 AM–1:00 PM Central",
  location: "Sample community center · Chicago",
  description: "Come together in the spirit of service and remembrance. This illustrative gathering celebrates the values of the Ashton Carter Memorial Foundation through community connection and volunteer service.",
}

export const sampleAttendees = [
  { name: "Alex Sample", email: "alex@example.com", reference: "DEMO-ALEX", eventId: sampleEvent.id, status: "confirmed" },
  { name: "Jordan Sample", email: "jordan@example.com", reference: "DEMO-JORDAN", eventId: sampleEvent.id, status: "confirmed" },
  { name: "Taylor Sample", email: "taylor@example.com", reference: "DEMO-REVOKED", eventId: sampleEvent.id, status: "revoked" },
  { name: "Casey Sample", email: "casey@example.com", reference: "DEMO-OTHER", eventId: "another-sample-event", status: "confirmed" },
] as const

export const checkInOutcomes = ["ready", "pending", "error", "unavailable", "forbidden", "expired-session", "uncertain", "expired-ticket"] as const
export type CheckInOutcome = typeof checkInOutcomes[number]
export type CheckInResult = { status: "checked-in" | "valid" | "duplicate" | "invalid" | "wrong-event" | "revoked" | Exclude<CheckInOutcome, "ready" | "pending">; name?: string }
export type CheckInRequest = { reference: string; validateOnly: boolean }

// Illustrative labels only, not tokens, QR payloads, or an authorization mechanism.
export function evaluateSampleCheckIn(request: CheckInRequest, checkedIn: ReadonlySet<string>): CheckInResult {
  const attendee = sampleAttendees.find((item) => item.reference === request.reference.trim())
  if (!attendee) return { status: "invalid" }
  if (attendee.eventId !== sampleEvent.id) return { status: "wrong-event" }
  if (attendee.status === "revoked") return { status: "revoked" }
  if (checkedIn.has(attendee.reference)) return { status: "duplicate", name: attendee.name }
  return { status: request.validateOnly ? "valid" : "checked-in", name: attendee.name }
}
