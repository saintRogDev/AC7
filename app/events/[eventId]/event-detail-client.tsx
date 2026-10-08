"use client"

import { EventDetail } from "@/components/events-core/public/event-detail"
import { serverPublicAdapter } from "@/lib/events-core/server-adapter"

export function PublicEventDetail({ eventId }: { eventId: string }) {
  return (
    <EventDetail
      adapter={serverPublicAdapter}
      eventId={eventId}
      reloadKey="live"
      backHref="/events"
    />
  )
}
