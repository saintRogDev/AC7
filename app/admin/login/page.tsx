"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [email, setEmail] = useState("jordan@example.com")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("loading")

    // Mock authentication only — no real auth is connected.
    setTimeout(() => {
      if (email.trim().toLowerCase() === "jordan@example.com") {
        router.push("/admin")
      } else {
        setStatus("error")
      }
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
          <p className="mt-6 text-sm text-muted-foreground">Staff Admin — sign in to continue</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {status === "error" && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>We couldn&apos;t sign you in with that email and password. Please try again.</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ac7foundation.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-muted-foreground hover:text-accent-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Have an invitation?{" "}
          <Link href="/admin/invite" className="text-accent-foreground underline underline-offset-4 hover:text-foreground">
            Accept it here
          </Link>
        </p>
        <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
          Demo credentials: jordan@example.com / any password
        </p>
      </div>
    </main>
  )
}
