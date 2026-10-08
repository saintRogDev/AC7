"use client"

import Link from "next/link"
import { useState } from "react"
import { CalendarDays, MapPin } from "lucide-react"

import { formatEventWhen } from "@/lib/events-core/format"
import type { EventCore } from "@/lib/events-core/types"
import { EventStatusPill } from "../shared"

export function EventImage({
  src,
  alt,
  className = "",
}: {
  src: string | null
  alt: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-[#f4d9cd] via-[#f7e7c8] to-[#eadfcf] ${className}`}
        aria-hidden="true"
      >
        <CalendarDays className="size-8 text-[#c99a6b]" />
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} />
}

export function EventCard({ event, href }: { event: EventCore; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_45px_rgba(111,75,43,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(111,75,43,0.12)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <EventImage
          src={event.image_url}
          alt={event.title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <EventStatusPill status={event.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-serif text-2xl leading-tight text-foreground text-balance">{event.title}</h3>
        <p className="flex items-center gap-2 text-sm font-bold text-primary">
          <CalendarDays className="size-4 shrink-0" />
          {formatEventWhen(event.starts_at, event.ends_at, undefined)}
        </p>
        {event.location ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {event.location}
          </p>
        ) : null}
        {event.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
        ) : null}
        <span className="mt-auto pt-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          View & reserve →
        </span>
      </div>
    </Link>
  )
}
