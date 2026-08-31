// Mock data for AC7 Admin — Staff access

export type StaffRole = "Admin" | "Manager"
export type StaffStatus = "Active" | "Invited" | "Revoked"

export interface StaffMember {
  id: string
  name: string
  email: string
  role: StaffRole
  status: StaffStatus
  lastActive: string | null
  invitedAt?: string
}

export const staffMembers: StaffMember[] = [
  {
    id: "staff_1",
    name: "Jordan Williams",
    email: "jordan@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "2026-08-31T09:12:00Z",
  },
  {
    id: "staff_2",
    name: "Denise Carter",
    email: "denise.carter@example.com",
    role: "Manager",
    status: "Active",
    lastActive: "2026-08-30T18:40:00Z",
  },
  {
    id: "staff_3",
    name: "Marcus Reid",
    email: "marcus.reid@example.com",
    role: "Manager",
    status: "Invited",
    lastActive: null,
    invitedAt: "2026-08-28T12:00:00Z",
  },
  {
    id: "staff_4",
    name: "Tom Bradley",
    email: "tom.bradley@example.com",
    role: "Manager",
    status: "Revoked",
    lastActive: "2026-06-14T10:00:00Z",
  },
]

// Mock current session — swap for real auth session later.
export const currentUser = {
  name: "Jordan Williams",
  email: "jordan@example.com",
  role: "Admin" as StaffRole,
  initials: "JW",
}
