"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarClock, ChevronRight, Loader2, Lock, Pencil, Plus, QrCode as QrIcon, Users } from "lucide-react"

import type { EventsAdminAdapter } from "@/lib/events-core/adapter"
import type { StaffCapabilities } from "@/lib/events-core/branding"
import { formatEventWhen } from "@/lib/events-core/format"
import { isEstlError, type EstlError, type EventCore } from "@/lib/events-core/types"
import { EmptyState, EventStatusPill, InlineError, SectionSpinner } from "../shared"
import { AttendeesPanel } from "./attendees-panel"
import { CheckInPanel } from "./check-in-panel"
import { EventForm } from "./event-form"

type ListState =
  | { phase: "loading" }
  | { phase: "error"; error: EstlError }
  | { phase: "ready"; events: EventCore[]; nextCursor: string | null }

type View =
  | { mode: "list" }
  | { mode: "create" }
  | { mode: "edit"; event: EventCore }
  | { mode: "detail"; event: EventCore; tab: "attendees" | "checkin" }

export function EventsManager({
  adapter,
  capabilities,
  reloadKey,
}: {
  adapter: EventsAdminAdapter
  capabilities: StaffCapabilities
  reloadKey: unknown
}) {
  const [state, setState] = useState<ListState>({ phase: "loading" })
  const [view, setView] = useState<View>({ mode: "list" })
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(async () => {
    setState({ phase: "loading" })
    const result = await adapter.listEvents({ cursor: null })
    if (isEstlError(result)) return setState({ phase: "error", error: result.error })
    setState({ phase: "ready", events: result.data.events, nextCursor: result.data.next_cursor })
  }, [adapter])

  useEffect(() => {
    if (!capabilities.canManageEvents) return
    // Loading state belongs to this external server request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadKey, capabilities.canManageEvents])

  const loadMore = useCallback(async () => {
    if (state.phase !== "ready" || !state.nextCursor) return
    setLoadingMore(true)
    const result = await adapter.listEvents({ cursor: state.nextCursor })
    setLoadingMore(false)
    if (isEstlError(result)) return setState({ phase: "error", error: result.error })
    setState({
      phase: "ready",
      events: [...state.events, ...result.data.events],
      nextCursor: result.data.next_cursor,
    })
  }, [adapter, state])

  if (!capabilities.canManageEvents) {
    return (
      <div className="grid place-items-center gap-3 rounded-3xl border border-[#c8644b]/30 bg-[#c8644b]/8 px-6 py-16 text-center">
        <Lock className="size-8 text-[#c0563d]" />
        <p className="font-serif text-2xl text-[#a94a33]">Events access is restricted</p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Your staff role can review Forms submissions but does not include the Events module. Ask an admin if you
          believe you should have access.
        </p>
      </div>
    )
  }

  if (view.mode === "create" || view.mode === "edit") {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
        <EventForm
          adapter={adapter}
          event={view.mode === "edit" ? view.event : undefined}
          onCancel={() => setView({ mode: "list" })}
          onDone={() => {
            setView({ mode: "list" })
            void load()
          }}
        />
      </div>
    )
  }

  if (view.mode === "detail") {
    const { event, tab } = view
    return (
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setView({ mode: "list" })}
              className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary hover:underline"
            >
              ← Back to events
            </button>
            <h2 className="mt-1 font-serif text-3xl text-foreground">{event.title}</h2>
            <p className="text-sm text-muted-foreground">{formatEventWhen(event.starts_at, event.ends_at)}</p>
          </div>
          <button
            type="button"
            onClick={() => setView({ mode: "edit", event })}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-extrabold text-foreground transition hover:border-primary"
          >
            <Pencil className="size-3.5" /> Edit event
          </button>
        </div>

        <div className="flex gap-2">
          <TabButton active={tab === "attendees"} onClick={() => setView({ mode: "detail", event, tab: "attendees" })} icon={<Users className="size-4" />}>
            Attendees
          </TabButton>
          {capabilities.canCheckIn ? (
            <TabButton active={tab === "checkin"} onClick={() => setView({ mode: "detail", event, tab: "checkin" })} icon={<QrIcon className="size-4" />}>
              Check-in
            </TabButton>
          ) : null}
        </div>

        {tab === "attendees" ? (
          <AttendeesPanel adapter={adapter} eventId={event.id} reloadKey={reloadKey} />
        ) : (
          <CheckInPanel adapter={adapter} eventId={event.id} />
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground">
          <CalendarClock className="size-5 text-primary" />
          <h2 className="font-serif text-3xl">All events</h2>
        </div>
        <button
          type="button"
          onClick={() => setView({ mode: "create" })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground transition hover:bg-primary"
        >
          <Plus className="size-4" /> New event
        </button>
      </div>

      {state.phase === "loading" ? <SectionSpinner label="Loading events…" /> : null}
      {state.phase === "error" ? <InlineError error={state.error} onRetry={load} /> : null}
      {state.phase === "ready" && state.events.length === 0 ? (
        <EmptyState title="No events yet">Create your first event to start taking registrations.</EmptyState>
      ) : null}

      {state.phase === "ready" && state.events.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
          <div className="divide-y divide-border">
            {state.events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setView({ mode: "detail", event, tab: "attendees" })}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-card"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-extrabold text-foreground">{event.title}</span>
                    <EventStatusPill status={event.status} />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {formatEventWhen(event.starts_at, event.ends_at)}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
          {state.nextCursor ? (
            <div className="border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-extrabold text-foreground transition hover:border-primary disabled:opacity-60"
              >
                {loadingMore ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${
        active ? "bg-foreground text-white" : "border border-border bg-card text-foreground hover:border-primary"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
