import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AcceptInviteForm } from "./accept-invite-form"
import { isInviteSession } from "@/lib/auth/invite-session"
export const dynamic = "force-dynamic"
export const metadata = { title: "Accept invitation | AC7 Foundation", robots: { index: false, follow: false } }
export default async function AcceptInvitePage() {
  let authorized = false
  let invitationSession = false
  try {
    const auth = (await createClient()).auth
    const [{ data: userData, error: userError }, { data: sessionData, error: sessionError }] = await Promise.all([
      auth.getUser(), auth.getSession(),
    ])
    if (sessionError) throw sessionError
    authorized = !userError && Boolean(userData.user) && userData.user?.id === sessionData.session?.user.id
    if (authorized && sessionData.session) {
      const { data, error } = await auth.getClaims(sessionData.session.access_token)
      invitationSession = !error && data?.claims.sub === userData.user?.id && isInviteSession(data?.claims.amr)
    }
  } catch { redirect("/login?reason=invite_unavailable") }
  if (!authorized) redirect("/login?reason=invalid_invite")
  if (!invitationSession) redirect("/admin")
  return <main className="mx-auto max-w-lg space-y-6 px-5 py-16"><h1 className="font-serif text-3xl">Welcome to AC7 Foundation</h1>
    <p>Choose your password to finish setting up staff access.</p><AcceptInviteForm /></main>
}
