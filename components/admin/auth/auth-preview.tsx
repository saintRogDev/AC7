"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { PreviewNotice, PreviewSelect } from "@/components/admin/preview-controls"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AuthForm, authModes, authOutcomes, type AuthMode, type AuthResult } from "./auth-form"

export function AuthPreview() {
  const [mode, setMode] = useState<AuthMode>("Sign in")
  const [outcome, setOutcome] = useState<typeof authOutcomes[number]>("success")
  const [revision, setRevision] = useState(0)
  const [held, setHeld] = useState(false)
  const [open, setOpen] = useState(false)
  const [deliveryUnknown, setDeliveryUnknown] = useState(false)
  const complete = useRef<((result: AuthResult) => void) | null>(null)
  async function submit(): Promise<AuthResult> {
    if (outcome !== "pending") {
      if (outcome === "uncertain-delivery") setDeliveryUnknown(true)
      return outcome
    }
    setHeld(true)
    return new Promise((resolve) => { complete.current = resolve })
  }
  function finish(result: AuthResult) { if (result === "uncertain-delivery") setDeliveryUnknown(true); complete.current?.(result); complete.current = null; setHeld(false) }
  const controls = held && <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => finish("success")}>Complete sample successfully</Button><Button type="button" variant="outline" onClick={() => finish("error")}>Complete sample with error</Button></div>
  return <div className="flex min-w-0 flex-col gap-6">
    <AdminPageHeader title="Auth · presentation review" description="Review the forms and their outcomes without signing in or sending invitations." actions={<Button asChild variant="outline"><Link href="/admin/events">Events review</Link></Button>} />
    <PreviewNotice title="Synthetic review only">These components are disconnected from the existing demo login and invitation pages. No session, account, token, role, or delivery is created.</PreviewNotice>
    <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2"><PreviewSelect label="Auth view" value={mode} values={authModes} onChange={setMode} disabled={held} /><PreviewSelect label="Auth outcome" value={outcome} values={authOutcomes} onChange={setOutcome} disabled={held} /><Button variant="outline" disabled={held} onClick={() => { setDeliveryUnknown(false); setRevision((value) => value + 1) }}>Reset synthetic form</Button></div>
    {mode !== "Invite staff" ? <div className="flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-6">{controls}<AuthForm key={`${mode}-${outcome}-${revision}`} mode={mode} onSubmit={submit} /></div> : <Dialog open={open} onOpenChange={(next) => { if (!next && held) finish("uncertain-delivery"); setOpen(next) }}><DialogTrigger asChild><Button className="self-start">Open sample invitation</Button></DialogTrigger><DialogContent className="max-h-[90svh] overflow-y-auto"><DialogHeader><DialogTitle>Sample staff invitation</DialogTitle><DialogDescription>Review the invitation experience. Nothing is sent and no role is assigned.</DialogDescription></DialogHeader>{controls}{deliveryUnknown ? <PreviewNotice title="Invitation delivery unknown" error>Do not resend automatically. Delivery must be reconciled before retrying in a connected application. No message was sent here. Close and explicitly reset the synthetic form to start another demonstration.</PreviewNotice> : <AuthForm key={`${outcome}-${revision}`} mode="Invite staff" onSubmit={submit} />}</DialogContent></Dialog>}
  </div>
}
