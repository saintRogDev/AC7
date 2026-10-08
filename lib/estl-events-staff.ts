import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { probeStaffSession } from "@/lib/estl-events-adapter"
import { isEventsStaffRole, withEventsStaff, type StaffCall, type StaffContext } from "@/lib/estl-events-staff-core"
import { requireAc7Staff } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import type { EstlResult } from "@/lib/events-core/types"

/**
 * Server-side guard for Events pages. Reviewers are staff for Forms but have no
 * Events access, so they are turned away here rather than being shown a page
 * whose actions would fail later.
 */
export const requireEventsStaff = cache(async () => {
  const staff = await requireAc7Staff()
  if (!isEventsStaffRole(staff.role)) redirect("/admin?reason=events_unauthorized")
  return staff
})

async function readSession() {
  const client = await createClient()
  const [user, session] = await Promise.all([client.auth.getUser(), client.auth.getSession()])
  return {
    userId: user.error ? null : user.data.user?.id ?? null,
    sessionUserId: session.error ? null : session.data.session?.user.id ?? null,
    accessToken: session.error ? null : session.data.session?.access_token ?? null,
  }
}

/** Runs one admin Events call under a verified staff identity. */
export function callAsEventsStaff<T>(staff: StaffContext, call: StaffCall<T>): Promise<EstlResult<T>> {
  return withEventsStaff(staff, readSession, probeStaffSession, call)
}
