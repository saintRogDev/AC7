"use server"

import {
  checkIn as checkInCall,
  createEvent as createEventCall,
  listAllEvents,
  listAttendees as listAttendeesCall,
  registerGuest as registerGuestCall,
  updateEvent as updateEventCall,
} from "@/lib/estl-events-adapter"
import { callAsEventsStaff, requireEventsStaff } from "@/lib/estl-events-staff"
import type {
  AttendeeListPage,
  CheckInResult,
  ConfirmResult,
  EstlResult,
  EventInput,
  EventListPage,
} from "@/lib/events-core/types"

/**
 * Every action re-establishes the staff identity server-side. The client never
 * supplies an organization, an actor, or a role — those come from the verified
 * session and from ESTL's own view of it.
 */

export async function listEventsAction(cursor: string | null): Promise<EstlResult<EventListPage>> {
  const staff = await requireEventsStaff()
  return callAsEventsStaff(staff, (token) => listAllEvents(token, cursor))
}

export async function createEventAction(event: EventInput): Promise<EstlResult<{ id: string }>> {
  const staff = await requireEventsStaff()
  return callAsEventsStaff(staff, (token) => createEventCall(token, event))
}

export async function updateEventAction(
  eventId: string,
  event: EventInput,
): Promise<EstlResult<{ id: string }>> {
  const staff = await requireEventsStaff()
  return callAsEventsStaff(staff, (token) => updateEventCall(token, eventId, event))
}

export async function listAttendeesAction(
  eventId: string,
  cursor: string | null,
): Promise<EstlResult<AttendeeListPage>> {
  const staff = await requireEventsStaff()
  return callAsEventsStaff(staff, (token) => listAttendeesCall(token, eventId, cursor))
}

export async function registerGuestAction(input: {
  eventId: string
  name: string
  email: string
  idempotency_key: string
}): Promise<EstlResult<ConfirmResult>> {
  const staff = await requireEventsStaff()
  return callAsEventsStaff(staff, (token) => registerGuestCall(token, input))
}

export async function checkInAction(input: {
  eventId: string
  token?: string
  registration_id?: string
  validate_only?: boolean
}): Promise<EstlResult<CheckInResult>> {
  const staff = await requireEventsStaff()
  return callAsEventsStaff(staff, (token) => checkInCall(token, input))
}
