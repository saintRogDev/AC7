"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { classifyPasswordUpdateError } from "@east-saint/staff-invitations-client/auth-errors"
export function AcceptInviteForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const busy = useRef(false)
  return <form className="space-y-4" onChange={() => setMessage(null)} onSubmit={async event => {
    event.preventDefault()
    if (busy.current) return
    const data = new FormData(event.currentTarget)
    const password = String(data.get("password") ?? "")
    if (password.length < 8) { setMessage("Use at least eight characters."); return }
    if (password !== data.get("confirmation")) { setMessage("Passwords must match."); return }
    busy.current = true; setPending(true); setMessage(null)
    try {
      const { error } = await createClient().auth.updateUser({ password })
      if (error) {
        const kind = classifyPasswordUpdateError(error)
        setMessage(kind === "invalid_session" ? "This invitation session is no longer valid. Request a new invitation."
          : kind === "unavailable" ? "Password setup is unavailable. Please retry."
          : "That password was rejected. Choose a stronger password.")
        return
      }
      router.replace("/admin"); router.refresh()
    } catch { setMessage("Password setup is unavailable. Please retry.") }
    finally { busy.current = false; setPending(false) }
  }}>
    <fieldset disabled={pending} className="space-y-4">
      <label className="block">Password<input className="mt-1 block w-full rounded-lg border p-3" type="password" name="password" minLength={8} autoComplete="new-password" required /></label>
      <label className="block">Confirm password<input className="mt-1 block w-full rounded-lg border p-3" type="password" name="confirmation" minLength={8} autoComplete="new-password" required /></label>
      <button className="rounded-full border px-5 py-3 font-semibold" type="submit">{pending ? "Saving…" : "Set password"}</button>
    </fieldset>
    {message && <p role="alert">{message}</p>}
  </form>
}
