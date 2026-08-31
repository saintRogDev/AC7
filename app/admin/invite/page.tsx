"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const INVITED_EMAIL = "marcus.reid@example.com"

export default function AdminInvitePage() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "mismatch">("idle")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) return
    if (password !== confirm) {
      setStatus("mismatch")
      return
    }

    setStatus("loading")
    // Mock invite acceptance only — no real invitation API is connected.
    setTimeout(() => {
      setStatus("success")
      setTimeout(() => router.push("/admin/login"), 1600)
    }, 900)
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-xl tracking-[0.3em] uppercase text-foreground">Ashton Carter</h1>
            <p className="mt-1 text-[10px] tracking-[0.4em] uppercase text-muted-foreground">Memorial Foundation</p>
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">You&apos;ve been invited to join the staff admin</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="size-8 text-accent-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Invitation accepted</p>
              <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {status === "mismatch" && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>Passwords don&apos;t match. Please re-enter them.</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invited-email">Invited email</Label>
                <Input id="invited-email" type="email" value={INVITED_EMAIL} disabled readOnly />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">Create password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>

              <Button type="submit" className="mt-2 w-full" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Setting up your account…
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-accent-foreground underline underline-offset-4 hover:text-foreground">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
