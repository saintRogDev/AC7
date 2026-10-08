import type { Metadata } from "next"

import { EventsWorkspace } from "./events-workspace"
import { capabilitiesForRole, type StaffRole } from "@/lib/events-core/branding"
import { requireEventsStaff } from "@/lib/estl-events-staff"

export const metadata: Metadata = {
  title: "Events | AC7 Foundation Admin",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

/**
 * Server-guarded entry point. `requireEventsStaff` redirects reviewers and
 * signed-out visitors before anything renders; the capabilities passed down are
 * for presentation only — every action re-checks authority on the server.
 */
export default async function AdminEventsPage() {
  const staff = await requireEventsStaff()

  return (
    <EventsWorkspace
      capabilities={capabilitiesForRole(staff.role as StaffRole)}
      environmentLabel={staff.orgSlug}
    />
  )
}
