// Typed operation callbacks. Components receive an adapter via props/context and
// never call the network directly. Codex will implement these against same-origin
// server routes; the demo adapter implements them against synthetic fixtures.
//
// The demo implementation must be explicit and injectable, NEVER a silent
// fallback after a real API failure.

import type {
  AttendeeListPage,
  CheckInResult,
  ConfirmResult,
  EstlResult,
  EventCore,
  EventInput,
  EventListPage,
  RegistrationAck,
} from "./types"

export interface EventsPublicAdapter {
  /** GET /v1/events -> published only, UUID ordered, cursor paged (<=100/page). */
  listEvents(input: { cursor: string | null }): Promise<EstlResult<EventListPage>>
  /** GET /v1/events/{eventId} */
  getEvent(input: { eventId: string }): Promise<EstlResult<EventCore>>
  /** POST /v1/events/{eventId}/registrations -> acknowledges request only. */
  createRegistration(input: {
    eventId: string
    name: string
    email: string
    idempotency_key: string
  }): Promise<EstlResult<RegistrationAck>>
  /** POST /v1/events/{eventId}/registrations/confirm */
  confirmRegistration(input: {
    eventId: string
    verification_token: string
  }): Promise<EstlResult<ConfirmResult>>
}

export interface EventsAdminAdapter {
  /** GET /v1/admin/events -> all states, same list envelope. */
  listEvents(input: { cursor: string | null }): Promise<EstlResult<EventListPage>>
  /** POST /v1/admin/events */
  createEvent(input: EventInput): Promise<EstlResult<{ id: string }>>
  /** PUT /v1/admin/events/{eventId} -> replaces the complete editable model. */
  updateEvent(input: { eventId: string; event: EventInput }): Promise<EstlResult<{ id: string }>>
  /** GET /v1/admin/events/{eventId}/attendees */
  listAttendees(input: { eventId: string; cursor: string | null }): Promise<EstlResult<AttendeeListPage>>
  /** POST /v1/admin/events/{eventId}/registrations -> ticket envelope (admin+manager). */
  registerGuest(input: {
    eventId: string
    name: string
    email: string
    idempotency_key: string
  }): Promise<EstlResult<ConfirmResult>>
  /** POST /v1/admin/events/{eventId}/check-in -> exactly one of token | registration_id. */
  checkIn(input: {
    eventId: string
    token?: string
    registration_id?: string
    validate_only?: boolean
  }): Promise<EstlResult<CheckInResult>>
}

export interface EventsAdapter {
  public: EventsPublicAdapter
  admin: EventsAdminAdapter
}
