"use client"

import { useId } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Field, FieldLabel } from "@/components/ui/field"

export function PreviewSelect<T extends string>({ label, value, values, onChange, disabled = false }: { label: string; value: T; values: readonly T[]; onChange: (value: T) => void; disabled?: boolean }) {
  const id = useId()
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><select id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T)} className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50">{values.map((option) => <option key={option} value={option}>{option}</option>)}</select></Field>
}

export function PreviewNotice({ title, children, error = false }: { title: string; children: React.ReactNode; error?: boolean }) {
  return <Alert role={error ? "alert" : "status"} variant={error ? "destructive" : "default"}><AlertTitle>{title}</AlertTitle><AlertDescription>{children}</AlertDescription></Alert>
}

export const viewStates = ["ready", "loading", "empty", "error", "unavailable", "forbidden", "expired-session"] as const
export type ViewState = typeof viewStates[number]
const stateCopy: Record<Exclude<ViewState, "ready">, [string, string]> = {
  loading: ["Loading preview", "This is a held loading scenario, not a live request."],
  empty: ["Nothing to display", "No sample records are available in this scenario."],
  error: ["Unable to load", "The sample request failed. Switch to ready to review the normal view."],
  unavailable: ["Temporarily unavailable", "This operation is not available. No changes were made."],
  forbidden: ["Access not permitted", "This scenario does not allow this operation. Contact the foundation administrator."],
  "expired-session": ["Session expired", "Sign in again before continuing in a connected version. No session exists in this preview."],
}
export function ViewStateNotice({ state }: { state: Exclude<ViewState, "ready"> }) {
  return <PreviewNotice title={stateCopy[state][0]} error={["error", "forbidden", "expired-session"].includes(state)}>{stateCopy[state][1]}</PreviewNotice>
}
