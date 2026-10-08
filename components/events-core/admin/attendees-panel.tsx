"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, ShieldCheck, UserPlus } from "lucide-react"

import type { EventsAdminAdapter } from "@/lib/events-core/adapter"
import { formatTimestamp } from "@/lib/events-core/format"
import { newIdempotencyKey } from "@/lib/events-core/idempotency"
import { isEstlError, type Attendee, type ConfirmResult, type EstlError } from "@/lib/events-core/types"
import { EmptyState, InlineError, SectionSpinner } from "../shared"
import { ManualAttendeeCheckIn } from "./manual-attendee-check-in"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ListState =
  | { phase: "loading" }
  | { phase: "error"; error: EstlError }
  | { phase: "ready"; attendees: Attendee[]; nextCursor: string | null }

function shortId(id: string | null) {
  if (!id) return "—"
  return id.slice(0, 8)
}

function AttendeeStatusChip({ attendee }: { attendee: Attendee }) {
  const checkedIn = Boolean(attendee.checked_in_at)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
        checkedIn ? "bg-[#4c8a5f]/12 text-[#3f7a52]" : "bg-muted text-muted-foreground"
      }`}
    >
      {checkedIn ? "Checked in" : attendee.status.replaceAll("_", " ")}
    </span>
  )
}

export function AttendeesPanel({ adapter, eventId, reloadKey }: { adapter: EventsAdminAdapter; eventId: string; reloadKey: unknown }) {
  const [state, setState] = useState<ListState>({ phase: "loading" })
  const [loadingMore, setLoadingMore] = useState(false)

  const load = useCallback(async () => {
    setState({ phase: "loading" })
    const result = await adapter.listAttendees({ eventId, cursor: null })
    if (isEstlError(result)) return setState({ phase: "error", error: result.error })
    setState({ phase: "ready", attendees: result.data.attendees, nextCursor: result.data.next_cursor })
  }, [adapter, eventId])

  useEffect(() => {
    // Loading state belongs to this external server request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadKey])

  const loadMore = useCallback(async () => {
    if (state.phase !== "ready" || !state.nextCursor) return
    setLoadingMore(true)
    const result = await adapter.listAttendees({ eventId, cursor: state.nextCursor })
    setLoadingMore(false)
    if (isEstlError(result)) return setState({ phase: "error", error: result.error })
    setState({
      phase: "ready",
      attendees: [...state.attendees, ...result.data.attendees],
      nextCursor: result.data.next_cursor,
    })
  }, [adapter, eventId, state])

  return (
    <div className="grid gap-6">
      <GuestRegistration adapter={adapter} eventId={eventId} onRegistered={load} />

      <div>
        <h3 className="mb-3 font-serif text-2xl text-foreground">Attendees</h3>
        {state.phase === "loading" ? <SectionSpinner label="Loading attendees…" /> : null}
        {state.phase === "error" ? <InlineError error={state.error} onRetry={load} /> : null}
        {state.phase === "ready" && state.attendees.length === 0 ? (
          <EmptyState title="No attendees yet">
            Registrations confirmed by guests, and guests you add here, will appear in this list.
          </EmptyState>
        ) : null}
        {state.phase === "ready" && state.attendees.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
            <div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr] gap-4 border-b border-border px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground md:grid">
              <span>Guest</span>
              <span>Status</span>
              <span>Registered</span>
              <span>Admitted</span>
            </div>
            <div className="divide-y divide-border">
              {state.attendees.map((a) => (
                <div key={a.id} className="grid gap-2 px-5 py-4 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr] md:items-center md:gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-foreground">{a.guest_info.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.guest_info.email}</p>
                    {a.staff_registered_by ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <ShieldCheck className="size-3" /> Staff-added · actor {shortId(a.staff_registered_by)}
                      </p>
                    ) : null}
                  </div>
                  <AttendeeStatusChip attendee={a} />
                  <span className="text-xs text-muted-foreground">{formatTimestamp(a.created_at)}</span>
                  <ManualAttendeeCheckIn key={`${eventId}:${a.id}`} adapter={adapter} eventId={eventId} attendee={a}
                    onAdmitted={(at) => setState((current) => current.phase === "ready" ? {
                      ...current, attendees: current.attendees.map((row) => row.id === a.id ? { ...row, checked_in_at: at } : row),
                    } : current)} />
                </div>
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
    </div>
  )
}

function GuestRegistration({
  adapter,
  eventId,
  onRegistered,
}: {
  adapter: EventsAdminAdapter
  eventId: string
  onRegistered: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<EstlError | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [result, setResult] = useState<ConfirmResult | null>(null)
  const intentRef = useRef<{ eventId: string; name: string; email: string; key: string } | null>(null)

  const submit = useCallback(async () => {
    setError(null)
    setFieldError(null)
    setResult(null)
    if (name.trim().length < 2) return setFieldError("Enter the guest's name.")
    if (!EMAIL_RE.test(email.trim())) return setFieldError("Enter a valid email address.")
    const intent = { eventId, name: name.trim(), email: email.trim() }
    if (!intentRef.current || intentRef.current.eventId !== intent.eventId ||
        intentRef.current.name !== intent.name || intentRef.current.email !== intent.email) {
      intentRef.current = { ...intent, key: newIdempotencyKey() }
    }
    setBusy(true)
    const res = await adapter.registerGuest({
      eventId,
      name: name.trim(),
      email: email.trim(),
      idempotency_key: intentRef.current.key,
    })
    setBusy(false)
    if (isEstlError(res)) return setError(res.error)
    intentRef.current = null
    setResult(res.data)
    setName("")
    setEmail("")
    onRegistered()
  }, [adapter, eventId, name, email, onRegistered])

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
      <div className="flex items-center gap-2 text-foreground">
        <UserPlus className="size-5 text-primary" />
        <h3 className="font-serif text-2xl">Register a guest</h3>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Add a walk-in or phone registration. A confirmed ticket is issued immediately.
      </p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Add guest
        </button>
      </form>
      {fieldError ? <p className="mt-3 text-sm font-bold text-[#c0563d]">{fieldError}</p> : null}
      {error ? <div className="mt-3"><InlineError error={error} onRetry={() => void submit()} /></div> : null}
      {result ? (
        <div className="mt-3 rounded-2xl border border-[#4c8a5f]/25 bg-[#4c8a5f]/8 p-4">
          <p className="text-sm font-extrabold text-[#3f7a52]">
            {result.replayed ? "Guest was already registered — existing ticket kept." : "Guest registered and ticket issued."}
          </p>
          {result.token ? (
            <p className="mt-1 break-all font-mono text-xs text-foreground">Ticket token: {result.token}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">No new ticket was issued for this replay.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
