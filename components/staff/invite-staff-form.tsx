"use client"
import { useEffect, useRef, useState, useTransition } from "react"
import { invitationInput, invitationMessages, type InvitationInput, type InvitationResult } from "@east-saint/staff-invitations-client"

export function InviteStaffForm({ sendAction, roles }: {
  sendAction: (input: unknown) => Promise<InvitationResult>
  roles: Array<InvitationInput["role"]>
}) {
  const [review, setReview] = useState<InvitationInput | null>(null)
  const [result, setResult] = useState<InvitationResult | null>(null)
  const [pending, startTransition] = useTransition()
  const submitting = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const reviewRegion = useRef<HTMLElement>(null)
  useEffect(() => { if (review) reviewRegion.current?.focus() }, [review])
  function submit() {
    if (!review || submitting.current) return
    submitting.current = true
    startTransition(async () => {
      try {
        const outcome = await sendAction(review)
        setResult(outcome)
        if (outcome.status === "sent") { setReview(null); form.current?.reset() }
      } catch { setResult({ status: "unavailable" }) }
      finally { submitting.current = false }
    })
  }
  return <div className="max-w-xl space-y-6">
    <form ref={form} className="space-y-4" onSubmit={(event) => {
      event.preventDefault()
      const parsed = invitationInput.safeParse(Object.fromEntries(new FormData(event.currentTarget)))
      setResult(null)
      if (!parsed.success || !roles.includes(parsed.data.role)) { setResult({ status: "invalid" }); return }
      setReview(parsed.data)
    }}>
      <fieldset disabled={pending || review !== null} className="space-y-4 disabled:opacity-60">
        <label className="block">Email<input className="mt-1 block w-full rounded-lg border bg-white p-3 text-black" name="email" type="email" autoComplete="off" maxLength={254} required /></label>
        <label className="block">Name (optional)<input className="mt-1 block w-full rounded-lg border bg-white p-3 text-black" name="name" autoComplete="off" maxLength={120} /></label>
        <label className="block">Role<select className="mt-1 block w-full rounded-lg border bg-white p-3 text-black" name="role" defaultValue={roles[0]}>
          {roles.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
        </select></label>
        <button className="rounded-full border px-5 py-3 font-semibold" type="submit">Review invitation</button>
      </fieldset>
    </form>
    {review && <section ref={reviewRegion} tabIndex={-1} aria-label="Review invitation" className="space-y-4 rounded-xl border p-5">
      <p>Invite <strong>{review.name || review.email}</strong> at {review.email} as <strong>{review.role}</strong>?</p>
      <p className="text-sm">This grants staff access to this site. An email will let them set their password.</p>
      <div className="flex gap-3">
        <button type="button" disabled={pending} onClick={submit} className="rounded-full border px-5 py-3 font-semibold">{pending ? "Sending…" : "Send invitation"}</button>
        <button type="button" disabled={pending} onClick={() => { setReview(null); setResult(null) }}>Edit</button>
      </div>
    </section>}
    <p role="status" aria-live="polite">{result ? result.status === "sent" ? `Invitation sent to ${result.email}.` : result.status === "invalid" && result.field ? `Check the ${result.field} field, then review the invitation again.` : invitationMessages[result.status] : ""}</p>
  </div>
}
