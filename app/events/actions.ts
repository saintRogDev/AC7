"use server"

import {
  confirmRegistration,
  getPublishedEvent,
  listPublishedEvents,
  requestRegistration,
} from "@/lib/estl-events-adapter"
import { estlEventsPublicEnabled } from "@/lib/estl-events-flags"
import { currentVisitorSourceIp } from "@/lib/estl-visitor-source"
import type {
  ConfirmResult,
  EstlResult,
  EventCore,
  EventListPage,
  RegistrationAck,
} from "@/lib/events-core/types"

const DISABLED = {
  error: { code: "EVENT_NOT_FOUND", message: "That event is unavailable." },
} as const

const UNATTRIBUTED = {
  error: { code: "UNAVAILABLE", message: "Events are temporarily unavailable. Try again shortly." },
} as const

/**
 * Public Events actions. These require no session, but they are still the only
 * way the browser reaches ESTL — the site key is never shipped to the client.
 *
 * While the public experience is disabled they behave as if nothing is there,
 * so an unreleased route cannot be driven by calling its actions directly.
 */

export async function listPublishedEventsAction(
  cursor: string | null,
): Promise<EstlResult<EventListPage>> {
  if (!estlEventsPublicEnabled()) return DISABLED
  return listPublishedEvents(cursor)
}

export async function getEventAction(eventId: string): Promise<EstlResult<EventCore>> {
  if (!estlEventsPublicEnabled()) return DISABLED
  return getPublishedEvent(eventId)
}

export async function requestRegistrationAction(input: {
  eventId: string
  name: string
  email: string
  idempotency_key: string
}): Promise<EstlResult<RegistrationAck>> {
  if (!estlEventsPublicEnabled()) return DISABLED
  // Fail closed when the visitor cannot be attributed: ESTL would refuse the
  // request anyway, and an unattributed send would bypass its source limit.
  const sourceIp = await currentVisitorSourceIp()
  if (!sourceIp) return UNATTRIBUTED
  return requestRegistration(input, sourceIp)
}

export async function confirmRegistrationAction(input: {
  eventId: string
  verification_token: string
}): Promise<EstlResult<ConfirmResult>> {
  if (!estlEventsPublicEnabled()) return DISABLED
  return confirmRegistration(input)
}
