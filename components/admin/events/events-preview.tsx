"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { PreviewNotice, PreviewSelect, ViewStateNotice, viewStates, type ViewState } from "@/components/admin/preview-controls"
import { Button } from "@/components/ui/button"
import { CheckInView } from "./check-in"
import { checkInOutcomes, evaluateSampleCheckIn, type CheckInOutcome, type CheckInResult, type CheckInRequest } from "./sample-events"
import { RegistrationForm, VisitorEvents, registrationOutcomes, type RegistrationResult, type VisitorView } from "./visitor-events"
import { StaffEvents, type StaffView } from "./staff-events"

const views = ["Public list", "Public detail", "RSVP", "Verification", "Ticket", "Staff list", "Editor", "Attendees", "Registration", "Check-in"] as const
export function EventsPreview() {
  const [view, setView] = useState<typeof views[number]>("Public list")
  const [state, setState] = useState<ViewState>("ready")
  const [registration, setRegistration] = useState<typeof registrationOutcomes[number]>("verification-required")
  const [checkScenario, setCheckScenario] = useState<CheckInOutcome>("ready")
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())
  const ledger = useRef(new Set<string>())
  const [revision, setRevision] = useState(0)
  const [held, setHeld] = useState(false)
  const completion = useRef<(() => void) | null>(null)

  function finishCheck(request: CheckInRequest): CheckInResult {
    const result = evaluateSampleCheckIn(request, ledger.current)
    if (result.status === "checked-in") {
      ledger.current.add(request.reference)
      setCheckedIn(new Set(ledger.current))
    }
    return result
  }
  async function checkIn(request: CheckInRequest): Promise<CheckInResult> {
    if (checkScenario === "pending") {
      setHeld(true)
      return new Promise((resolve) => { completion.current = () => resolve(finishCheck(request)) })
    }
    if (checkScenario !== "ready") return { status: checkScenario }
    return finishCheck(request)
  }
  async function register(): Promise<RegistrationResult> {
    if (registration !== "pending") return registration
    setHeld(true)
    return new Promise((resolve) => { completion.current = () => resolve("success") })
  }
  const visitor = views.indexOf(view) < 5
  return <div className="flex min-w-0 flex-col gap-6">
    <AdminPageHeader title="Events · presentation review" description="Community, remembrance, and service — a synthetic walkthrough for the foundation." actions={<Button variant="outline" asChild><Link href="/admin/auth-preview">Auth review</Link></Button>} />
    <PreviewNotice title="Sample data only · no services connected">These visitor and staff views are review surfaces, not live event listings. Nothing is sent, saved, issued, or published.</PreviewNotice>
    <div className="grid min-w-0 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2"><PreviewSelect label="View to review" value={view} values={views} disabled={held} onChange={setView} /><PreviewSelect label="Page scenario" value={state} values={viewStates} disabled={held} onChange={setState} />{view === "Check-in" ? <PreviewSelect label="Check-in scenario" value={checkScenario} values={checkInOutcomes} disabled={held} onChange={(next) => { setCheckScenario(next); setRevision((value) => value + 1) }} /> : <PreviewSelect label="Registration / ticket scenario" value={registration} values={registrationOutcomes} disabled={held} onChange={(next) => { setRegistration(next); setRevision((value) => value + 1) }} />}<div className="flex flex-col justify-end gap-2"><Button variant="outline" disabled={held} onClick={() => { ledger.current.clear(); setCheckedIn(new Set()); setRevision((value) => value + 1) }}>Reset synthetic session</Button><p className="text-sm text-muted-foreground">Sample check-ins: {checkedIn.size}. Reset clears only this demonstration.</p></div></div>
    {held && <Button onClick={() => { completion.current?.(); completion.current = null; setHeld(false) }}>Complete held sample request</Button>}
    <div className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6" key={`${view}-${revision}-${state}`}>
      {state !== "ready" ? <ViewStateNotice state={state} /> : view === "Check-in" ? <CheckInView onCheckIn={checkIn} /> : view === "Registration" ? <RegistrationForm staff onRegister={register} /> : visitor ? <VisitorEvents view={view as VisitorView} onNavigate={setView} onRegister={register} onVerify={register} outcome={registration === "pending" ? "verification-required" : registration} /> : <StaffEvents view={view as Exclude<StaffView, "Check-in" | "Registration">} onNavigate={setView} checkedIn={checkedIn} />}
    </div>
  </div>
}
