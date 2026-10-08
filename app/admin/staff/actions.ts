"use server"
import { requireAc7Staff } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { sendInvitationToEstl } from "@/lib/staff-invitation-transport"
import { submitStaffInvitation } from "@east-saint/staff-invitations-client/server"

export async function sendStaffInvitation(raw: unknown) {
  // Keep framework redirects outside the handler's provider-error catch.
  const staff = await requireAc7Staff()
  return submitStaffInvitation(raw, staff, createClient, sendInvitationToEstl)
}
