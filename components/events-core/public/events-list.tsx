"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import type { EventsPublicAdapter } from "@/lib/events-core/adapter"
import { isEstlError, type EstlError, type EventCore } from "@/lib/events-core/types"
import { CardSkeleton, EmptyState, InlineError } from "../shared"
import { EventCard } from "./event-card"

type State =
  | { phase: "loading" }
  | { phase: "error"; error: EstlError }
  | { phase: "ready"; events: EventCore[]; nextCursor: string | null }

export function EventsList({
  adapter,
  reloadKey,
  hrefFor,
}: {
  adapter: EventsPublicAdapter
  reloadKey: unknown
  hrefFor: (event: EventCore) => string
}) {
  const [state, setState] = useState<State>({ phase: "loading" })
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(async () => {
    setState({ phase: "loading" })
    const result = await adapter.listEvents({ cursor: null })
    if (isEstlError(result)) {
      setState({ phase: "error", error: result.error })
      return
    }
    setState({ phase: "ready", events: result.data.events, nextCursor: result.data.next_cursor })
  }, [adapter])

  useEffect(() => {
    // Loading state belongs to this external server request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadKey])

  const loadMore = useCallback(async () => {
    if (state.phase !== "ready" || !state.nextCursor) return
    setLoadingMore(true)
    const result = await adapter.listEvents({ cursor: state.nextCursor })
    setLoadingMore(false)
    if (isEstlError(result)) {
      setState({ phase: "error", error: result.error })
      return
    }
    setState({
      phase: "ready",
      events: [...state.events, ...result.data.events],
      nextCursor: result.data.next_cursor,
    })
  }, [adapter, state])

  if (state.phase === "loading") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (state.phase === "error") {
    return <InlineError error={state.error} onRetry={load} />
  }

  if (state.events.length === 0) {
    return (
      <EmptyState title="No upcoming events yet">
        New community events will appear here as soon as they&apos;re scheduled. Check back soon.
      </EmptyState>
    )
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {state.events.map((event) => (
          <EventCard key={event.id} event={event} href={hrefFor(event)} />
        ))}
      </div>
      {state.nextCursor ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-extrabold text-foreground shadow-sm transition hover:border-primary disabled:opacity-60"
          >
            {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  )
}
