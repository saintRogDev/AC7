import { requireAc7Staff } from "@/lib/admin-auth"
import { InviteStaffForm } from "@/components/staff/invite-staff-form"
import { sendStaffInvitation } from "./actions"
export default async function StaffPage() {
  const staff = await requireAc7Staff()
  if (staff.role !== "admin") return <p role="alert">Only administrators can invite staff.</p>
  return <section className="space-y-6"><h1 className="font-serif text-3xl">Invite staff</h1>
    <p>Give a new team member access to the AC7 Foundation staff portal.</p>
    <InviteStaffForm sendAction={sendStaffInvitation} roles={["reviewer", "manager", "admin"]} />
  </section>
}

// Includes authentication and the bounded ESTL request.
export const maxDuration = 120
