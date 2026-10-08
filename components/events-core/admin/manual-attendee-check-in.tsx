"use client"

import { useRef, useState } from "react"
import type { EventsAdminAdapter } from "@/lib/events-core/adapter"
import { isEstlError, type Attendee } from "@/lib/events-core/types"
import { formatTimestamp } from "@/lib/events-core/format"

export function ManualAttendeeCheckIn({ adapter, eventId, attendee, onAdmitted }: {
  adapter: EventsAdminAdapter
  eventId: string
  attendee: Attendee
  onAdmitted: (at: string) => void
}) {
  const inFlight = useRef(false)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<{ text: string; failed: boolean } | null>(null)

  async function admit() {
    if (inFlight.current || attendee.checked_in_at || attendee.status !== "registered") return
    inFlight.current = true
    setBusy(true)
    setOutcome(null)
    try {
      const result = await adapter.checkIn({ eventId, registration_id: attendee.id })
      if (isEstlError(result)) {
        setOutcome({ text: `Not confirmed: ${result.error.message}`, failed: true })
        return
      }
      const data = result.data
      if (data.id !== attendee.id || !data.checked_in_at || !Number.isFinite(Date.parse(data.checked_in_at)) || typeof data.already_checked_in !== "boolean") {
        setOutcome({ text: "Not confirmed. Refresh the attendee list before admitting this guest.", failed: true })
        return
      }
      setOutcome({ text: data.already_checked_in ? "Already admitted" : "Admitted", failed: false })
      onAdmitted(data.checked_in_at)
    } catch {
      setOutcome({ text: "Not confirmed. Refresh the attendee list before retrying.", failed: true })
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  return <div className="grid gap-2">
    <span className="text-xs text-muted-foreground">{attendee.checked_in_at ? formatTimestamp(attendee.checked_in_at) : "—"}</span>
    {!attendee.checked_in_at && attendee.status === "registered" ? <button
      type="button"
      aria-label={`Check in ${attendee.guest_info.name}`}
      disabled={busy}
      onClick={() => void admit()}
      className="rounded-full border border-border px-3 py-2 text-xs font-extrabold text-foreground disabled:opacity-60"
    >{busy ? "Checking in…" : "Check in guest"}</button> : null}
    {outcome ? <p role={outcome.failed ? "alert" : "status"} className="text-xs font-bold text-foreground">{outcome.text}</p> : null}
  </div>
}
