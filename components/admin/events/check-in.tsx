"use client"

import { useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PreviewNotice } from "@/components/admin/preview-controls"
import type { CheckInRequest, CheckInResult } from "./sample-events"

const messages: Record<CheckInResult["status"], [string, string]> = {
  "checked-in": ["Sample check-in recorded", "Only the local demonstration changed. No attendance was recorded on a server."],
  valid: ["Valid sample · not checked in", "Validate-only does not change attendance. Turn it off to demonstrate check-in."],
  duplicate: ["Already checked in", "No second check-in was added. Review the existing attendance record in a connected version."],
  invalid: ["Sample reference not recognized", "Use an exact sample label. Links and arbitrary scan contents are not opened or executed."],
  "wrong-event": ["Ticket belongs to another event", "No check-in was recorded for this event."],
  revoked: ["Ticket revoked", "This sample cannot be checked in."],
  "expired-ticket": ["Ticket expired", "This sample cannot be checked in."],
  error: ["Check-in failed", "Nothing was confirmed. Review the record before retrying."],
  unavailable: ["Check-in unavailable", "No offline attendance queue is maintained. Restore service before continuing."],
  forbidden: ["Check-in not permitted", "Permission to enter the portal is not permission to record attendance."],
  "expired-session": ["Session expired", "Sign in again in the connected application before trying this operation."],
  uncertain: ["Check-in outcome unknown", "Do not scan again yet. Reconcile attendance with the server before retrying."],
}

export function CheckInView({ onCheckIn }: { onCheckIn?: (request: CheckInRequest) => Promise<CheckInResult> }) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const busy = useRef(false)
  const [reference, setReference] = useState("")
  const [validateOnly, setValidateOnly] = useState(true)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const blocked = pending || result?.status === "uncertain" || !onCheckIn

  async function submit() {
    if (busy.current || blocked || !reference.trim() || !onCheckIn) return
    busy.current = true
    setPending(true)
    setResult(null)
    try { setResult(await onCheckIn({ reference: reference.trim(), validateOnly })) }
    catch { setResult({ status: "uncertain" }) }
    finally { busy.current = false; setPending(false); input.current?.focus() }
  }

  return <section className="flex min-w-0 flex-col gap-6" aria-label="Event check-in">
    <div><h2 className="font-serif text-2xl">Welcome guests</h2><p className="text-sm leading-relaxed text-muted-foreground">Scan into the focused field with a keyboard-wedge scanner, or type a sample reference. Camera capture is not connected.</p></div>
    <form onSubmit={(event) => { event.preventDefault(); void submit() }} className="flex flex-col gap-4" aria-busy={pending}>
      <FieldGroup><Field><FieldLabel htmlFor={id}>Scan or enter sample reference</FieldLabel><Input ref={input} id={id} value={reference} autoComplete="off" spellCheck={false} maxLength={160} readOnly={blocked} onChange={(event) => setReference(event.target.value)} aria-describedby={`${id}-help`} onKeyDown={(event) => {
        if (event.key !== "Enter") return
        event.preventDefault()
        if (event.nativeEvent.isComposing || event.keyCode === 229) return
        void submit()
      }} /><FieldDescription id={`${id}-help`}>Try DEMO-ALEX, DEMO-JORDAN, DEMO-OTHER or DEMO-REVOKED. These are not admission credentials.</FieldDescription></Field>
      <Field orientation="horizontal"><input id={`${id}-validate`} type="checkbox" checked={validateOnly} disabled={blocked} onChange={(event) => { setValidateOnly(event.target.checked); setResult(null) }} className="size-4 accent-current" /><FieldLabel htmlFor={`${id}-validate`}>Validate only — do not check in</FieldLabel></Field></FieldGroup>
      <Button disabled={blocked || !reference.trim()} type="submit">{pending ? "Checking sample…" : validateOnly ? "Validate sample" : "Check in sample"}</Button>
    </form>
    {!onCheckIn && <PreviewNotice title="Check-in disconnected">A callback is required. No attendance action is available.</PreviewNotice>}
    {pending && <PreviewNotice title="Check-in pending">Further scans are blocked until this request completes.</PreviewNotice>}
    {result && <PreviewNotice title={messages[result.status][0]} error={!["valid", "checked-in", "duplicate"].includes(result.status)}>{result.name && <span>{result.name}. </span>}{messages[result.status][1]}</PreviewNotice>}
  </section>
}
