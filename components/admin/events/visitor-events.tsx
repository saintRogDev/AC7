"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PreviewNotice } from "@/components/admin/preview-controls"
import { sampleEvent } from "./sample-events"

export const registrationOutcomes = ["verification-required", "success", "pending", "duplicate", "full", "closed", "cancelled", "invalid", "expired", "revoked", "error", "unavailable", "uncertain-delivery"] as const
export type RegistrationResult = Exclude<typeof registrationOutcomes[number], "pending">
export type RegistrationValues = { name: string; email: string }
export type VisitorView = "Public list" | "Public detail" | "RSVP" | "Verification" | "Ticket"
const feedback: Record<RegistrationResult, [string, string]> = {
  "verification-required": ["Verification required · sample", "A connected version would ask you to check your email. No message was sent in this preview."],
  success: ["Preview complete", "No registration, verification, or ticket issuance occurred."],
  duplicate: ["Registration already exists", "Use the existing registration rather than creating another."],
  full: ["This gathering is full", "No registration was created. There is no automatic waitlist in this preview."],
  closed: ["Registration is closed", "This event is no longer accepting registrations."],
  cancelled: ["Event cancelled", "No admission or registration is available."],
  invalid: ["Verification not recognized", "Request help with your registration in the connected application."],
  expired: ["Verification expired", "A new verification would be needed. No replacement is sent here."],
  revoked: ["Registration revoked", "This sample ticket cannot be used for admission."],
  error: ["Request failed", "No successful result was confirmed. Please review before retrying."],
  unavailable: ["Service unavailable", "Try again when the connected service is available."],
  "uncertain-delivery": ["Delivery unknown", "Do not resend automatically. Check delivery status before trying again; no email was sent here."],
}

export function RegistrationForm({ onRegister, staff = false }: { onRegister?: (values: RegistrationValues) => Promise<RegistrationResult>; staff?: boolean }) {
  const lock = useRef(false)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<RegistrationResult | null>(null)
  const blocked = pending || result === "uncertain-delivery" || result === "success" || result === "verification-required" || !onRegister
  return <form className="flex flex-col gap-5" aria-busy={pending} onSubmit={async (event) => {
    event.preventDefault()
    if (lock.current || blocked || !onRegister) return
    const values = new FormData(event.currentTarget)
    lock.current = true; setPending(true); setResult(null)
    try { setResult(await onRegister({ name: String(values.get("name")).trim(), email: String(values.get("email")).trim() })) }
    catch { setResult("uncertain-delivery") }
    finally { lock.current = false; setPending(false) }
  }}>
    <h2 className="font-serif text-2xl">{staff ? "Register a sample attendee" : "Join us in service"}</h2>
    <FieldGroup><Field><FieldLabel htmlFor="rsvp-name">Sample guest name</FieldLabel><Input id="rsvp-name" name="name" required maxLength={100} defaultValue="Alex Sample" autoComplete="off" disabled={blocked} /></Field><Field><FieldLabel htmlFor="rsvp-email">Sample email</FieldLabel><Input id="rsvp-email" name="email" type="email" required maxLength={200} defaultValue="alex@example.com" autoComplete="off" disabled={blocked} /></Field></FieldGroup>
    <p className="text-sm text-muted-foreground">Synthetic data only. No email, reservation, payment, or admission credential will be created.</p>
    <Button disabled={blocked}>{pending ? "Preview request pending…" : "Preview registration"}</Button>
    {!onRegister && <PreviewNotice title="Registration disconnected">A registration callback is required.</PreviewNotice>}
    {pending && <PreviewNotice title="Registration pending">Duplicate submissions are blocked.</PreviewNotice>}
    {result && <PreviewNotice title={feedback[result][0]} error={!["success", "verification-required", "duplicate"].includes(result)}>{feedback[result][1]}</PreviewNotice>}
  </form>
}

export function VisitorEvents({ view, onNavigate, onRegister, onVerify, outcome }: { view: VisitorView; onNavigate: (view: VisitorView) => void; onRegister: (values: RegistrationValues) => Promise<RegistrationResult>; onVerify: () => Promise<RegistrationResult>; outcome: RegistrationResult }) {
  const verifyLock = useRef(false)
  const [verification, setVerification] = useState<RegistrationResult | "pending" | null>(null)
  const verified = verification === "success"
  if (view === "RSVP") return <RegistrationForm onRegister={onRegister} />
  if (view === "Verification") return <section className="flex flex-col gap-5"><h2 className="font-serif text-2xl">Confirm your attendance</h2><p className="text-sm leading-relaxed">This is a verification presentation, not a link or token verifier.</p><PreviewNotice title={feedback[outcome][0]} error={!["success", "verification-required"].includes(outcome)}>{feedback[outcome][1]}</PreviewNotice><Button disabled={verification === "pending" || verified || verification === "uncertain-delivery"} onClick={async () => { if (verifyLock.current) return; verifyLock.current = true; setVerification("pending"); try { setVerification(await onVerify()) } catch { setVerification("error") } finally { verifyLock.current = false } }}>Preview verification completion</Button>{verification === "pending" && <PreviewNotice title="Verification pending">No token is read or verified. Complete the held sample request.</PreviewNotice>}{verification && verification !== "pending" && !verified && <PreviewNotice title={feedback[verification][0]}>{feedback[verification][1]}</PreviewNotice>}{verified && <><PreviewNotice title="Sample verification complete">No identity was verified. You can inspect the illustrative ticket.</PreviewNotice><Button variant="outline" onClick={() => onNavigate("Ticket")}>View sample ticket</Button></>}</section>
  if (view === "Ticket") return <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"><Badge variant="outline">SAMPLE · NOT VALID FOR ADMISSION</Badge><h2 className="font-serif text-2xl">{sampleEvent.title}</h2><p>{sampleEvent.date}</p><p>{sampleEvent.location}</p><p>Alex Sample · DEMO-ALEX</p><p className="text-sm text-muted-foreground">No QR code, barcode, token, or downloadable credential is generated.</p>{outcome !== "success" && <PreviewNotice title={feedback[outcome][0]}>{feedback[outcome][1]}</PreviewNotice>}</section>
  return <section className="flex flex-col gap-6"><p className="text-sm uppercase tracking-widest text-muted-foreground">Gathering in remembrance</p><h2 className="text-balance font-serif text-3xl sm:text-4xl">{view === "Public list" ? "Community & service" : sampleEvent.title}</h2><article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"><Badge variant="outline" className="self-start">Illustrative event</Badge>{view === "Public list" && <h3 className="font-serif text-2xl">{sampleEvent.title}</h3>}<p className="text-sm">{sampleEvent.date}<br />{sampleEvent.location}</p><p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">{sampleEvent.description}</p>{["cancelled", "full", "closed"].includes(outcome) && <PreviewNotice title={feedback[outcome][0]}>{feedback[outcome][1]}</PreviewNotice>}<Button className="self-start" disabled={view === "Public detail" && ["cancelled", "full", "closed"].includes(outcome)} onClick={() => onNavigate(view === "Public list" ? "Public detail" : "RSVP")}>{view === "Public list" ? "Explore sample event" : "Preview RSVP"}</Button></article></section>
}
