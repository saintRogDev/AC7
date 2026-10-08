"use client"

import { EventsList } from "@/components/events-core/public/events-list"
import { serverPublicAdapter } from "@/lib/events-core/server-adapter"

export function PublicEventsList() {
  return (
    <EventsList
      adapter={serverPublicAdapter}
      reloadKey="live"
      hrefFor={(event) => `/events/${event.id}`}
    />
  )
}
