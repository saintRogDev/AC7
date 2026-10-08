import type { EstlResult } from "@/lib/events-core/types"

/**
 * Staff authorization for Events, independent of navigation.
 *
 * Two boundaries must both hold before any admin Events call is forwarded:
 *
 *  1. AC7's own session says this user is an Events-capable staff member of the
 *     resolved tenant. AC7's Forms admin also admits `reviewer`; Events does not.
 *  2. ESTL agrees. `/v1/admin/session` is called with the same bearer token and
 *     must report the expected organization slug and a manager/admin role, so a
 *     misconfigured site credential cannot silently act against another tenant.
 *
 * Neither check is inferred from the UI. Navigation visibility is not authorization.
 */

export const EVENTS_STAFF_ROLES = ["admin", "manager"] as const
export type EventsStaffRole = (typeof EVENTS_STAFF_ROLES)[number]

export function isEventsStaffRole(role: string): role is EventsStaffRole {
  return (EVENTS_STAFF_ROLES as readonly string[]).includes(role)
}

export type StaffContext = { role: string; userId: string; orgSlug: string }

type SessionReader = () => Promise<{
  userId: string | null
  sessionUserId: string | null
  accessToken: string | null
}>

type SessionProbe = (token: string) => Promise<EstlResult<{
  organization?: { slug?: string }
  staff?: { role?: string }
}>>

export type StaffCall<T> = (token: string) => Promise<EstlResult<T>>

function failure<T>(code: string, message: string): EstlResult<T> {
  return { error: { code, message } }
}

/**
 * Resolves a verified bearer token for `staff`, or an error result. The token is
 * only returned once AC7's session and ESTL's view of it agree.
 */
export async function authorizeEventsStaff(
  staff: StaffContext,
  readSession: SessionReader,
  probeSession: SessionProbe,
): Promise<EstlResult<{ token: string }>> {
  if (!isEventsStaffRole(staff.role)) {
    return failure("FORBIDDEN", "Your staff role does not include Events access.")
  }

  let session: Awaited<ReturnType<SessionReader>>
  try {
    session = await readSession()
  } catch {
    return failure("UNAVAILABLE", "Events are temporarily unavailable. Try again shortly.")
  }

  // getUser() is authenticated against the auth server; getSession() supplies the
  // token. Both must describe the same person as the resolved staff context.
  if (
    !session.accessToken ||
    !session.userId ||
    session.userId !== staff.userId ||
    session.sessionUserId !== staff.userId
  ) {
    return failure("UNAUTHORIZED", "Your session has expired. Sign in again.")
  }

  const probe = await probeSession(session.accessToken)
  if ("error" in probe) return probe as EstlResult<{ token: string }>

  if (probe.data?.organization?.slug !== staff.orgSlug) {
    // The site credential resolves to a different tenant than this site's admin.
    return failure("FORBIDDEN", "Your staff role does not include Events access.")
  }
  const role = probe.data?.staff?.role
  if (typeof role !== "string" || !isEventsStaffRole(role)) {
    return failure("FORBIDDEN", "Your staff role does not include Events access.")
  }

  return { data: { token: session.accessToken } }
}

/** Authorizes, then performs one admin Events call with the verified token. */
export async function withEventsStaff<T>(
  staff: StaffContext,
  readSession: SessionReader,
  probeSession: SessionProbe,
  call: StaffCall<T>,
): Promise<EstlResult<T>> {
  const authorized = await authorizeEventsStaff(staff, readSession, probeSession)
  if ("error" in authorized) return authorized as EstlResult<T>
  return call(authorized.data.token)
}
