import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { resolveAc7AdminOrgSlug } from "@/lib/admin-environment"
import { createClient } from "@/lib/supabase/server"

export const AC7_ADMIN_ORG_SLUG = resolveAc7AdminOrgSlug(process.env.VERCEL_ENV)

const STAFF_ROLES = new Set(["admin", "manager", "reviewer"])

export type Ac7Staff = {
  email: string | null
  name: string | null
  orgId: string
  orgSlug: string
  role: "admin" | "manager" | "reviewer"
  userId: string
}

export const requireAc7Staff = cache(async (): Promise<Ac7Staff> => {
  let supabase
  try {
    supabase = await createClient()
  } catch {
    redirect("/login?reason=configuration")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_roles")
      .select("org_id, role, organizations!inner(slug)")
      .eq("user_id", user.id),
  ])

  type RoleRow = {
    org_id: string
    role: string
    organizations: { slug: string } | { slug: string }[] | null
  }

  const assignment = ((rolesResult.data ?? []) as RoleRow[]).find((row) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations
    return organization?.slug === AC7_ADMIN_ORG_SLUG && STAFF_ROLES.has(row.role)
  })

  if (!assignment || !isStaffRole(assignment.role)) {
    redirect("/login?reason=unauthorized")
  }

  return {
    email: user.email ?? null,
    name: profileResult.data?.name ?? null,
    orgId: assignment.org_id,
    orgSlug: AC7_ADMIN_ORG_SLUG,
    role: assignment.role,
    userId: user.id,
  }
})

function isStaffRole(role: string): role is Ac7Staff["role"] {
  return role === "admin" || role === "manager" || role === "reviewer"
}
