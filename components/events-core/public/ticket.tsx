"use client"

import { CalendarDays, CheckCircle2, MapPin } from "lucide-react"

import { formatEventWhen } from "@/lib/events-core/format"
import type { EventCore } from "@/lib/events-core/types"
import { DemoDataBadge } from "../shared"
import { QrCode } from "../qr-code"

// The ticket is presented ONLY after a fresh confirmation returns a token.
// A replay (already confirmed) never reaches this screen.
export function Ticket({ event, token, demo = false }: { event: EventCore; token: string; demo?: boolean }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_45px_rgba(111,75,43,0.08)]">
      <div className="flex items-center gap-3 bg-foreground px-6 py-4 text-white">
        <CheckCircle2 className="size-5 text-accent" />
        <p className="font-serif text-2xl">You&apos;re confirmed</p>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="grid justify-items-center gap-3">
          <QrCode value={token} label={`Entry ticket for ${event.title}`} />
          <DemoDataBadge demo={demo} />
        </div>
        <div className="grid gap-3">
          <h3 className="font-serif text-2xl leading-tight text-foreground text-balance">{event.title}</h3>
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <CalendarDays className="size-4 shrink-0" />
            {formatEventWhen(event.starts_at, event.ends_at)}
          </p>
          {event.location ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {event.location}
            </p>
          ) : null}
          <div className="mt-1 rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Entry token</p>
            <p className="mt-1 break-all font-mono text-xs text-foreground">{token}</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Save a screenshot of this QR code and bring it with you — an AC7 staff member will scan it at the door.
            This ticket is not emailed. If you lose it, staff can look up your registration.
          </p>
        </div>
      </div>
    </div>
  )
}
