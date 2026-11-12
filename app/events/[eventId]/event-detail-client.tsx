"use client"

import { PaidRegistration } from "@/components/events-core/public/paid-tickets"
import { serverPaidAdapter } from "@/lib/events-core/paid-server-adapter"
import { EventDetail } from "@/components/events-core/public/event-detail"
import { serverPublicAdapter } from "@/lib/events-core/server-adapter"

export function PublicEventDetail({ eventId, paidEnabled = false }: { eventId: string; paidEnabled?: boolean }) {
  return (
    <EventDetail
      adapter={serverPublicAdapter}
      eventId={eventId}
      reloadKey="live"
      renderRegistration={(event, freeRegistration) => <PaidRegistration key={event.id} event={event} adapter={serverPaidAdapter} freeRegistration={freeRegistration} salesEnabled={paidEnabled} eventHref={`/events/${event.id}`} />}
      backHref="/events"
    />
  )
}
