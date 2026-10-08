// Branding is kept separate from behavior so a second tenant (AC7) can reuse the
// same components later with different copy. Do NOT create a shared package now.

export interface EventsBranding {
  orgName: string
  /** Short label shown in the staff shell eyebrow. */
  studioLabel: string
  /** Default timezone label surfaced to public visitors. */
  timeZone?: string
}

export const AC7_BRANDING: EventsBranding = {
  orgName: "AC7 Foundation",
  studioLabel: "AC7 admin",
  timeZone: undefined,
}

// Staff authority is derived from verified server context in production. In the
// demo, role selection is a presentation control ONLY and grants no real access.
export type StaffRole = "admin" | "manager" | "reviewer"

export interface StaffCapabilities {
  canManageEvents: boolean
  canViewAttendees: boolean
  canRegisterGuests: boolean
  canCheckIn: boolean
}

/**
 * Capability mapping mirroring the contract: admins and managers run Events,
 * attendees, guest registration and check-in. Reviewers (Forms reviewers in the
 * existing AC7 admin) do NOT gain any Events/attendee privileges.
 */
export function capabilitiesForRole(role: StaffRole): StaffCapabilities {
  const manager = role === "admin" || role === "manager"
  return {
    canManageEvents: manager,
    canViewAttendees: manager,
    canRegisterGuests: manager,
    canCheckIn: manager,
  }
}
