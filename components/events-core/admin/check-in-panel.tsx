"use client"

import { useCallback, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"

import type { EventsAdminAdapter } from "@/lib/events-core/adapter"
import { formatTimestamp } from "@/lib/events-core/format"
import { isEstlError, isValidToken, type EstlError } from "@/lib/events-core/types"
import { InlineError } from "../shared"
import { QrScanner } from "../qr-scanner"

type Outcome =
  | { kind: "admitted"; at: string }
  | { kind: "repeat"; at: string }
  | { kind: "validated"; checkedIn: boolean; at: string | null }
  | { kind: "unresolved"; message: string }

export function CheckInPanel({ adapter, eventId }: { adapter: EventsAdminAdapter; eventId: string }) {
  const [token, setToken] = useState("")
  const [scanCaptured, setScanCaptured] = useState(false)
  const [validateOnly, setValidateOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<EstlError | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const runCheckIn = useCallback(
    async (rawToken: string, validate: boolean) => {
      setError(null)
      setOutcome(null)
      const value = rawToken.trim()
      if (!isValidToken(value)) {
        setError({ code: "VALIDATION", message: "Enter a valid 43-character ticket token, or scan a code." })
        return
      }
      setBusy(true)
      const result = await adapter.checkIn({ eventId, token: value, validate_only: validate })
      setBusy(false)
      if (isEstlError(result)) return setError(result.error)

      const at = result.data.checked_in_at
      if (validate) {
        setOutcome({ kind: "validated", checkedIn: Boolean(at), at })
        return
      }
      if (!at || typeof result.data.already_checked_in !== "boolean") {
        // A non-validating check-in that returns no timestamp is unresolved.
        // Never invent a client-side time and call it an admission.
        setOutcome({
          kind: "unresolved",
          message: "Check-in did not confirm. Re-scan before admitting this guest.",
        })
        return
      }
      // This status was decided under the server's registration lock.
      setOutcome({ kind: result.data.already_checked_in ? "repeat" : "admitted", at })
    },
    [adapter, eventId],
  )

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 font-mono text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
        <h3 className="mb-3 font-serif text-2xl text-foreground">Scan a ticket</h3>
        <QrScanner
          onDetected={(value) => {
            setToken(value)
            setScanCaptured(true)
            void runCheckIn(value, validateOnly)
          }}
        />
        {scanCaptured && token ? (
          <div role="status" className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
            <p className="font-extrabold">Ticket scanned — added to the manual entry field.</p>
            <p className="mt-1">
              {busy
                ? "Checking the ticket… Wait for the result before admitting the guest."
                : "See the check-in result below before admitting the guest."}
            </p>
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_16px_45px_rgba(111,75,43,0.06)]">
        <h3 className="mb-3 font-serif text-2xl text-foreground">Manual entry</h3>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            void runCheckIn(token, validateOnly)
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">Ticket token</span>
            <input value={token} onChange={(e) => { setToken(e.target.value); setScanCaptured(false) }} spellCheck={false} className={inputClass} placeholder="Paste the 43-character token" />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <input type="checkbox" checked={validateOnly} onChange={(e) => setValidateOnly(e.target.checked)} className="size-4 accent-primary" />
            Validate only (don&apos;t admit)
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {validateOnly ? "Validate ticket" : "Check in"}
          </button>
        </form>

        {error ? <div className="mt-4"><InlineError error={error} /></div> : null}
        {outcome ? <div className="mt-4"><OutcomeCard outcome={outcome} /></div> : null}
      </div>
    </div>
  )
}

function OutcomeCard({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === "validated") {
    return (
      <div className="rounded-2xl border border-muted-foreground/25 bg-muted-foreground/8 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-5" />
          <p className="text-sm font-extrabold">{outcome.checkedIn ? "Already admitted" : "Valid ticket — not admitted"}</p>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {outcome.checkedIn
            ? `This guest was already admitted at ${formatTimestamp(outcome.at)}.`
            : "This ticket is valid and this guest has not been admitted yet."}
        </p>
      </div>
    )
  }
  if (outcome.kind === "unresolved") {
    return (
      <div className="rounded-2xl border border-[#c8644b]/30 bg-primary/8 p-4">
        <div className="flex items-center gap-2 text-primary">
          <AlertTriangle className="size-5" />
          <p className="text-sm font-extrabold">Not confirmed</p>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{outcome.message}</p>
      </div>
    )
  }
  if (outcome.kind === "repeat") {
    // Amber, not green: this ticket was admitted before this scan.
    return (
      <div className="rounded-2xl border border-[#e0b13a]/40 bg-accent/12 p-4">
        <div className="flex items-center gap-2 text-[#8a6a1f]">
          <AlertTriangle className="size-5" />
          <p className="text-sm font-extrabold">Already admitted</p>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          This ticket was already used at {formatTimestamp(outcome.at)}. Check with the guest before
          admitting again.
        </p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-[#4c8a5f]/25 bg-[#4c8a5f]/8 p-4">
      <div className="flex items-center gap-2 text-[#3f7a52]">
        <CheckCircle2 className="size-5" />
        <p className="text-sm font-extrabold">Admitted</p>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">Admitted at {formatTimestamp(outcome.at)}.</p>
    </div>
  )
}

export { XCircle }
