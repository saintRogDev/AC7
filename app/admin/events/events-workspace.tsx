"use client"

import { useState } from "react"
import { TicketSalesPanel } from "@/components/events-core/admin/ticket-sales-panel"
import { configureTicketOfferingAction, ticketOfferingAction, ticketSalesAction } from "./actions"

const ticketActions = { offering: ticketOfferingAction, sales: ticketSalesAction, configure: configureTicketOfferingAction }

import { EventsManager } from "@/components/events-core/admin/events-manager"
import { serverAdminAdapter } from "@/lib/events-core/server-adapter"
import type { StaffCapabilities } from "@/lib/events-core/branding"

export function EventsWorkspace({
  capabilities,
  environmentLabel,
  paidEnabled = false,
}: {
  capabilities: StaffCapabilities
  environmentLabel: string
  paidEnabled?: boolean
}) {
  // Bumping this re-runs the manager's loaders after a mutation succeeds.
  const [reloadKey] = useState(() => `live:${environmentLabel}`)

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-primary">AC7 staff console</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl leading-tight text-foreground">Events management</h1>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold text-foreground">
            {environmentLabel}
          </span>
        </div>
        <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
          Events, attendees and check-in for this organization. Free guests registered by staff receive no
          email — hand them their ticket, or check them in manually.
        </p>
      </header>

      <EventsManager adapter={serverAdminAdapter} capabilities={capabilities} reloadKey={reloadKey} renderTickets={paidEnabled ? event => <TicketSalesPanel key={event.id} event={event} actions={ticketActions} /> : undefined} />
    </div>
  )
}
