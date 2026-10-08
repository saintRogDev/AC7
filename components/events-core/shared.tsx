"use client"

import type { ReactNode } from "react"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"

import type { EstlError, EventStatus } from "@/lib/events-core/types"

/**
 * Opt-in only. This must never render on a live page: a real guest holding a
 * ticket stamped "Demo data" is a ticket door staff will refuse.
 */
export function DemoDataBadge({ demo = false, className = "" }: { demo?: boolean; className?: string }) {
  if (!demo) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#e0b13a]/40 bg-accent/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8a6a1f] ${className}`}
    >
      <span className="size-1.5 rounded-full bg-[#e0a72a]" aria-hidden="true" /> Demo data
    </span>
  )
}

const STATUS_STYLES: Record<EventStatus, string> = {
  published: "bg-[#4c8a5f]/12 text-[#3f7a52] border-[#4c8a5f]/25",
  draft: "bg-muted-foreground/12 text-muted-foreground border-muted-foreground/25",
  cancelled: "bg-[#c8644b]/12 text-red-300 border-[#c8644b]/25",
}

export function EventStatusPill({ status }: { status: EventStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}

export function SectionSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl border border-border bg-card/70 px-6 py-16 text-center">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-extrabold text-muted-foreground">{label}</p>
      <span className="sr-only" role="status">
        {label}
      </span>
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-[#d9c6ad] bg-card/70 px-6 py-16 text-center">
      <p className="font-serif text-2xl text-foreground">{title}</p>
      {children ? <p className="max-w-sm text-sm leading-6 text-muted-foreground">{children}</p> : null}
    </div>
  )
}

export function InlineError({
  error,
  onRetry,
}: {
  error: EstlError
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-[#c8644b]/30 bg-[#c8644b]/8 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-300" aria-hidden="true" />
        <div>
          <p className="text-sm font-extrabold text-red-300">{error.message}</p>
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#c8644b] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#b5573f]"
        >
          <RefreshCw className="size-3.5" /> Try again
        </button>
      ) : null}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-border" />
      <div className="grid gap-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-border" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-border" />
        <div className="h-3 w-full animate-pulse rounded-full bg-border" />
      </div>
    </div>
  )
}
