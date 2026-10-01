"use client"

import { useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PreviewNotice } from "@/components/admin/preview-controls"

export const authModes = ["Sign in", "Accept invitation", "Invite staff", "Reset password"] as const
export type AuthMode = typeof authModes[number]
export const authOutcomes = ["success", "pending", "error", "denied", "expired", "unavailable", "uncertain-delivery"] as const
export type AuthResult = Exclude<typeof authOutcomes[number], "pending">
export type AuthValues = { email: string; password?: string; name?: string }
export type AuthCallback = (values: AuthValues) => Promise<AuthResult>
const messages: Record<AuthResult, [string, string]> = {
  success: ["Preview complete", "No authentication, account creation, password change, role assignment, or email delivery took place."],
  error: ["Request failed", "The demonstration returned an error. Check the form and try the preview again."],
  denied: ["Access denied", "This request is not permitted. Portal entry does not grant permission for every operation."],
  expired: ["Session or invitation expired", "A connected service must verify current access before this can continue."],
  unavailable: ["Service unavailable", "This action is not connected. Please contact the foundation administrator in a live application."],
  "uncertain-delivery": ["Invitation delivery unknown", "Do not resend automatically. Check delivery status before retrying. This preview sent nothing."],
}

export function AuthForm({ mode, onSubmit }: { mode: AuthMode; onSubmit?: AuthCallback }) {
  const id = useId()
  const lock = useRef(false)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<AuthResult | null>(null)
  const [validation, setValidation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const hasPassword = mode === "Sign in" || mode === "Accept invitation"
  const blocked = pending || result === "success" || result === "uncertain-delivery" || !onSubmit
  const errorId = `${id}-error`

  return <form className="flex flex-col gap-5" aria-busy={pending} onSubmit={async (event) => {
    event.preventDefault()
    if (lock.current || blocked || !onSubmit) return
    const form = event.currentTarget
    const data = new FormData(form)
    const password = String(data.get("password") ?? "")
    if (mode === "Accept invitation" && (password.length < 8 || password !== data.get("confirm"))) {
      setValidation(password.length < 8 ? "Use at least 8 characters for the sample password." : "Sample passwords do not match.")
      form.querySelector<HTMLInputElement>("[name=password]")?.focus()
      return
    }
    lock.current = true; setPending(true); setResult(null); setValidation("")
    try { setResult(await onSubmit({ email: String(data.get("email")).trim(), ...(hasPassword ? { password } : {}), ...(mode === "Invite staff" ? { name: String(data.get("name")).trim() } : {}) })) }
    catch { setResult(mode === "Invite staff" || mode === "Reset password" ? "uncertain-delivery" : "error") }
    finally {
      form.querySelectorAll<HTMLInputElement>('input[type="password"], input[name="password"], input[name="confirm"]').forEach((input) => { input.value = "" })
      lock.current = false; setPending(false)
    }
  }}>
    <h2 className="font-serif text-2xl">{mode}</h2>
    <p className="text-sm leading-relaxed text-muted-foreground">Synthetic preview. Use example.com addresses and invented passwords only. No credentials are persisted, logged, or sent to a service.</p>
    <FieldGroup>
      {mode === "Invite staff" && <Field><FieldLabel htmlFor={`${id}-name`}>Sample name</FieldLabel><Input id={`${id}-name`} name="name" required defaultValue="Alex Sample" disabled={blocked} autoComplete="off" maxLength={100} /></Field>}
      <Field><FieldLabel htmlFor={`${id}-email`}>Sample email</FieldLabel><Input id={`${id}-email`} name="email" type="email" required defaultValue="alex@example.com" autoComplete="off" disabled={blocked} maxLength={200} /></Field>
      {hasPassword && <Field data-invalid={!!validation}><FieldLabel htmlFor={`${id}-password`}>Sample password</FieldLabel><Input id={`${id}-password`} name="password" type={showPassword ? "text" : "password"} required autoComplete="off" disabled={blocked} aria-invalid={!!validation} aria-describedby={validation ? errorId : `${id}-help`} /><FieldDescription id={`${id}-help`}>{mode === "Accept invitation" ? "Use at least 8 invented characters. " : ""}Do not enter a real password.</FieldDescription><Button type="button" variant="ghost" aria-controls={`${id}-password`} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}> {showPassword ? "Hide password" : "Show password"}</Button></Field>}
      {mode === "Accept invitation" && <Field data-invalid={!!validation}><FieldLabel htmlFor={`${id}-confirm`}>Confirm sample password</FieldLabel><Input id={`${id}-confirm`} name="confirm" type={showConfirm ? "text" : "password"} required autoComplete="off" disabled={blocked} aria-invalid={!!validation} aria-describedby={validation ? errorId : undefined} /><Button type="button" variant="ghost" aria-controls={`${id}-confirm`} aria-pressed={showConfirm} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "Hide confirmation" : "Show confirmation"}</Button></Field>}
    </FieldGroup>
    {validation && <p id={errorId} role="alert" className="text-sm text-destructive">{validation}</p>}
    {mode === "Invite staff" && <p className="text-sm text-muted-foreground">No role is assigned here. Authorized role choices and permission checks belong to the connected service.</p>}
    <Button type="submit" disabled={blocked}>{pending ? "Preview request pending…" : `Preview ${mode.toLowerCase()}`}</Button>
    {!onSubmit && <PreviewNotice title="Action disconnected">An injected callback is required. This form cannot authenticate or deliver an invitation.</PreviewNotice>}
    {pending && <PreviewNotice title="Request pending">Please wait. Duplicate submissions are blocked.</PreviewNotice>}
    {result && <PreviewNotice title={messages[result][0]} error={result !== "success"}>{messages[result][1]}</PreviewNotice>}
  </form>
}
