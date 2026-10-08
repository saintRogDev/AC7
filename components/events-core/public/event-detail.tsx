"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, MailCheck, MapPin } from "lucide-react"

import type { EventsPublicAdapter } from "@/lib/events-core/adapter"
import { formatEventWhen, hasEnded } from "@/lib/events-core/format"
import { newDemoToken, newIdempotencyKey } from "@/lib/events-core/idempotency"
import { isEstlError, isValidToken, type EstlError, type EventCore } from "@/lib/events-core/types"
import { DemoDataBadge, EventStatusPill, InlineError, SectionSpinner } from "../shared"
import { EventImage } from "./event-card"
import { Ticket } from "./ticket"

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; error: EstlError }
  | { phase: "ready"; event: EventCore }

type FlowStep = "form" | "sent" | "confirmed_no_ticket" | "ticket"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EventDetail({
  adapter,
  eventId,
  reloadKey,
  backHref,
  demo = false,
}: {
  adapter: EventsPublicAdapter
  eventId: string
  reloadKey: unknown
  backHref: string
  /** Demo affordances. Never enable on a live page. */
  demo?: boolean
}) {
  const [state, setState] = useState<LoadState>({ phase: "loading" })

  const load = useCallback(async () => {
    setState({ phase: "loading" })
    const result = await adapter.getEvent({ eventId })
    if (isEstlError(result)) {
      setState({ phase: "error", error: result.error })
      return
    }
    setState({ phase: "ready", event: result.data })
  }, [adapter, eventId])

  useEffect(() => {
    // Loading state belongs to this external server request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load, reloadKey])

  return (
    <div className="grid gap-6">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-primary transition hover:text-primary"
      >
        <ArrowLeft className="size-4" /> All events
      </Link>

      {state.phase === "loading" ? <SectionSpinner label="Loading this event…" /> : null}
      {state.phase === "error" ? <InlineError error={state.error} onRetry={load} /> : null}
      {state.phase === "ready" ? <EventDetailBody adapter={adapter} event={state.event} demo={demo} /> : null}
    </div>
  )
}

function EventDetailBody({ adapter, event, demo }: { adapter: EventsPublicAdapter; event: EventCore; demo: boolean }) {
  const closed = event.status !== "published" || hasEnded(event.ends_at)

  return (
    <article className="grid gap-8">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
        <div className="relative aspect-[16/9]">
          <EventImage src={event.image_url} alt={event.title} className="h-full w-full" />
          <div className="absolute left-4 top-4">
            <EventStatusPill status={event.status} />
          </div>
        </div>
        <div className="grid gap-4 p-6">
          <h1 className="font-serif text-4xl leading-tight text-foreground text-balance">{event.title}</h1>
          <div className="grid gap-2">
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
          </div>
          {event.description ? (
            <p className="text-pretty text-base leading-7 text-muted-foreground">{event.description}</p>
          ) : null}
        </div>
      </div>

      {closed ? (
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <p className="font-serif text-2xl text-foreground">Registration is closed</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {event.status === "cancelled"
              ? "This event has been cancelled."
              : "This event is no longer open for new registrations."}
          </p>
        </div>
      ) : (
        <RsvpFlow adapter={adapter} event={event} demo={demo} />
      )}
    </article>
  )
}

function RsvpFlow({ adapter, event, demo }: { adapter: EventsPublicAdapter; event: EventCore; demo: boolean }) {
  const [step, setStep] = useState<FlowStep>("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<EstlError | null>(null)

  const [code, setCode] = useState("")
  const [ticketToken, setTicketToken] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  // Idempotency: one key per unchanged submission intent, reused across retries.
  const intentRef = useRef<{ key: string; name: string; email: string } | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  function keyForCurrentIntent() {
    const current = intentRef.current
    if (current && current.name === name.trim() && current.email === email.trim()) {
      return current.key // retry of the same payload -> reuse
    }
    const key = newIdempotencyKey() // new/changed payload -> new key
    intentRef.current = { key, name: name.trim(), email: email.trim() }
    return key
  }

  const submitRsvp = useCallback(async () => {
    setError(null)
    setFieldError(null)
    if (name.trim().length < 2) {
      setFieldError("Please enter your name.")
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setFieldError("Please enter a valid email address.")
      return
    }
    setBusy(true)
    const result = await adapter.createRegistration({
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      idempotency_key: keyForCurrentIntent(),
    })
    setBusy(false)
    if (isEstlError(result)) {
      setError(result.error)
      return
    }
    setStep("sent")
    setCooldown(30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, event.id, name, email])

  const resend = useCallback(async () => {
    if (cooldown > 0 || busy) return
    // Deliberate resend after cooldown -> brand-new idempotency key.
    intentRef.current = { key: newIdempotencyKey(), name: name.trim(), email: email.trim() }
    setBusy(true)
    setError(null)
    const result = await adapter.createRegistration({
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      idempotency_key: intentRef.current.key,
    })
    setBusy(false)
    if (isEstlError(result)) {
      setError(result.error)
      return
    }
    setCooldown(30)
  }, [adapter, cooldown, busy, event.id, name, email])

  const confirm = useCallback(async () => {
    setError(null)
    const token = code.trim()
    if (!isValidToken(token)) {
      setError({ code: "VALIDATION", message: "That code doesn't look right. It should be 43 characters." })
      return
    }
    setBusy(true)
    const result = await adapter.confirmRegistration({ eventId: event.id, verification_token: token })
    setBusy(false)
    if (isEstlError(result)) {
      setError(result.error)
      return
    }
    if (result.data.replayed || !result.data.token) {
      setStep("confirmed_no_ticket")
      return
    }
    setTicketToken(result.data.token)
    setStep("ticket")
  }, [adapter, code, event.id])

  if (step === "ticket" && ticketToken) {
    return <Ticket event={event} token={ticketToken} demo={demo} />
  }

  if (step === "confirmed_no_ticket") {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
        <div className="flex items-center gap-3 text-[#3f7a52]">
          <CheckCircle2 className="size-5" />
          <p className="font-serif text-2xl text-foreground">Already confirmed</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This registration was already confirmed, so no new ticket was issued. Your saved ticket is still valid.
          Tickets are not emailed. If you did not save yours, AC7 staff can look up your registration at the event.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-3xl text-foreground">Reserve your place</h2>
        <DemoDataBadge demo={demo} />
      </div>

      {step === "form" ? (
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submitRsvp()
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Jordan Rivera"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Email address</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </label>
          {fieldError ? <p className="text-sm font-bold text-[#c0563d]">{fieldError}</p> : null}
          {error ? (
            // A rate-limited network cannot succeed by retrying at once; the message names the wait.
            <InlineError error={error} onRetry={error.code === "RATE_LIMITED" ? undefined : () => void submitRsvp()} />
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {busy ? "Sending…" : "Request my spot"}
          </button>
          <p className="text-xs leading-5 text-muted-foreground">
            We&apos;ll email you a verification code to confirm your registration. Your place isn&apos;t held until you
            confirm.
          </p>
        </form>
      ) : (
        <div className="mt-5 grid gap-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-[#3f7a52]" />
            <div>
              <p className="text-sm font-extrabold text-foreground">Check your inbox</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Check <strong className="break-all">{email.trim()}</strong> for your verification code,
                then paste it below to finish. Your place is not held until registration succeeds.
              </p>
            </div>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Verification code (43 characters)
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 font-mono text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Paste the code from your email"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Confirming…" : "Confirm registration"}
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={cooldown > 0 || busy}
              className="text-xs font-extrabold text-primary transition hover:text-primary disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
            </button>
          </div>

          {demo ? (
            <button
              type="button"
              onClick={() => setCode(newDemoToken())}
              className="w-fit rounded-full border border-dashed border-[#e0b13a]/50 bg-accent/10 px-3 py-1.5 text-[11px] font-extrabold text-[#8a6a1f] transition hover:bg-accent/20"
            >
              Fill a demo verification code
            </button>
          ) : null}

          {error ? <InlineError error={error} onRetry={undefined} /> : null}
        </div>
      )}
    </div>
  )
}
