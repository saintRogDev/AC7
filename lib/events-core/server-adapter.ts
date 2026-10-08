"use client"

import {
  checkInAction,
  createEventAction,
  listAttendeesAction,
  listEventsAction,
  registerGuestAction,
  updateEventAction,
} from "@/app/admin/events/actions"
import {
  confirmRegistrationAction,
  getEventAction,
  listPublishedEventsAction,
  requestRegistrationAction,
} from "@/app/events/actions"
import type { EventsAdminAdapter, EventsPublicAdapter } from "./adapter"

/**
 * Real adapters. Each method is a server action call, so the site key and any
 * staff bearer token stay on the server and the browser never sees ESTL.
 *
 * These are deliberately separate from the demo adapter: a failure here returns
 * an error result and is rendered as one. Demo fixtures are never a fallback.
 */

export const serverPublicAdapter: EventsPublicAdapter = {
  listEvents: ({ cursor }) => listPublishedEventsAction(cursor),
  getEvent: ({ eventId }) => getEventAction(eventId),
  createRegistration: (input) => requestRegistrationAction(input),
  confirmRegistration: (input) => confirmRegistrationAction(input),
}

export const serverAdminAdapter: EventsAdminAdapter = {
  listEvents: ({ cursor }) => listEventsAction(cursor),
  createEvent: (event) => createEventAction(event),
  updateEvent: ({ eventId, event }) => updateEventAction(eventId, event),
  listAttendees: ({ eventId, cursor }) => listAttendeesAction(eventId, cursor),
  registerGuest: (input) => registerGuestAction(input),
  checkIn: (input) => checkInAction(input),
}
