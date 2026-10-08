import "server-only"

import { estlEventsRequest } from "@/lib/estl-events"
import type {
  Attendee,
  AttendeeListPage,
  CheckInResult,
  ConfirmResult,
  EstlResult,
  EventCore,
  EventInput,
  EventListPage,
  RegistrationAck,
} from "@/lib/events-core/types"

/**
 * Server-side implementation of the adapter contract the presentation layer
 * consumes. Every call is same-origin from the browser's perspective: the site
 * key and any staff bearer token stay on the server.
 *
 * These functions return error results; they never fall back to demo fixtures
 * or to the legacy Google Sheets data.
 */

function withCursor(path: string, cursor: string | null): string {
  if (!cursor) return path
  return `${path}?cursor=${encodeURIComponent(cursor)}`
}

/* ---------------------------------------------------------------- public -- */

export function listPublishedEvents(cursor: string | null = null): Promise<EstlResult<EventListPage>> {
  return estlEventsRequest<EventListPage>({ path: withCursor("/v1/events", cursor) })
}

export function getPublishedEvent(eventId: string): Promise<EstlResult<EventCore>> {
  return estlEventsRequest<EventCore>({ path: `/v1/events/${encodeURIComponent(eventId)}` })
}

/**
 * Requests an email verification code. The response is an acknowledgement only —
 * it is never evidence that a place was reserved, that mail was delivered, or
 * that this address was already registered. `sourceIp` is the visitor address
 * this server observed from trusted infrastructure; ESTL limits requests per
 * source and refuses unattributed ones.
 */
export function requestRegistration(
  input: {
    eventId: string
    name: string
    email: string
    idempotency_key: string
  },
  sourceIp: string,
): Promise<EstlResult<RegistrationAck>> {
  return estlEventsRequest<RegistrationAck>({
    path: `/v1/events/${encodeURIComponent(input.eventId)}/registrations`,
    method: "POST",
    body: { name: input.name, email: input.email, idempotency_key: input.idempotency_key },
    sourceIp,
  })
}

/** Exchanges a mailbox proof for a registration. Capacity is decided here. */
export function confirmRegistration(input: {
  eventId: string
  verification_token: string
}): Promise<EstlResult<ConfirmResult>> {
  return estlEventsRequest<ConfirmResult>({
    path: `/v1/events/${encodeURIComponent(input.eventId)}/registrations/confirm`,
    method: "POST",
    body: { verification_token: input.verification_token },
  })
}

/* ----------------------------------------------------------------- admin -- */

export function probeStaffSession(token: string) {
  return estlEventsRequest<{ organization?: { slug?: string }; staff?: { role?: string } }>({
    path: "/v1/admin/session",
    token,
  })
}

export function listAllEvents(token: string, cursor: string | null = null) {
  return estlEventsRequest<EventListPage>({ path: withCursor("/v1/admin/events", cursor), token })
}

export function createEvent(token: string, event: EventInput) {
  return estlEventsRequest<{ id: string }>({
    path: "/v1/admin/events",
    method: "POST",
    body: event,
    token,
  })
}

/** PUT replaces the complete editable model, including deliberate nulls. */
export function updateEvent(token: string, eventId: string, event: EventInput) {
  return estlEventsRequest<{ id: string }>({
    path: `/v1/admin/events/${encodeURIComponent(eventId)}`,
    method: "PUT",
    body: event,
    token,
  })
}

export function listAttendees(token: string, eventId: string, cursor: string | null = null) {
  return estlEventsRequest<AttendeeListPage>({
    path: withCursor(`/v1/admin/events/${encodeURIComponent(eventId)}/attendees`, cursor),
    token,
  })
}

/** Staff-assisted registration. Sends no email; registration is not check-in. */
export function registerGuest(
  token: string,
  input: { eventId: string; name: string; email: string; idempotency_key: string },
) {
  return estlEventsRequest<ConfirmResult>({
    path: `/v1/admin/events/${encodeURIComponent(input.eventId)}/registrations`,
    method: "POST",
    body: { name: input.name, email: input.email, idempotency_key: input.idempotency_key },
    token,
  })
}

/**
 * Validate, scan or manually check in. Exactly one of token/registration_id.
 * `validate_only` reads state without checking anyone in.
 */
export function checkIn(
  token: string,
  input: {
    eventId: string
    token?: string
    registration_id?: string
    validate_only?: boolean
  },
): Promise<EstlResult<CheckInResult>> {
  const body: Record<string, unknown> = {}
  if (input.token !== undefined) body.token = input.token
  if (input.registration_id !== undefined) body.registration_id = input.registration_id
  if (input.validate_only) body.validate_only = true
  return estlEventsRequest<CheckInResult>({
    path: `/v1/admin/events/${encodeURIComponent(input.eventId)}/check-in`,
    method: "POST",
    body,
    token,
  })
}

export type { Attendee, EventCore, EventInput }
