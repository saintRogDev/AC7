import { estlEventsPublicEnabled } from "@/lib/estl-events-flags"
import type { Metadata } from "next"

import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Staff Sign In | AC7 Foundation",
  description: "Sign in to the AC7 Foundation staff portal.",
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const initialMessage =
    reason === "invalid_invite"
      ? "This invitation is invalid, expired, or already used."
      : reason === "invite_unavailable"
      ? "Invitation verification is unavailable. Please reopen your invitation to retry."
      : reason === "unauthorized"
      ? "This account is not authorized for this AC7 Foundation staff portal."
      : reason === "configuration"
        ? "Staff sign-in is not configured for this environment."
        : null

  return (
    <>
      <Navigation eventsEnabled={estlEventsPublicEnabled()} />
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-accent/15 px-5 pb-20 pt-32">
        <LoginForm initialMessage={initialMessage} />
      </main>
      <Footer />
    </>
  )
}
