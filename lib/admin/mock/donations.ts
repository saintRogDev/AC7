// Mock data for AC7 Admin — Donations
// Read-only visibility layer only. The public donation flow and Stripe
// integration are untouched — this mirrors what a future ESTL donations
// adapter would surface to staff.

export type DonationFrequency = "One-time" | "Monthly"
export type DonationStatus = "Completed" | "Pending" | "Failed" | "Refunded"

export interface Donation {
  id: string
  donor: string
  email: string
  amount: number
  frequency: DonationFrequency
  status: DonationStatus
  date: string
  referenceId: string
  message?: string
}

export const donations: Donation[] = [
  {
    id: "don_2001",
    donor: "Renee Walker",
    email: "renee.walker@example.com",
    amount: 250,
    frequency: "Monthly",
    status: "Completed",
    date: "2026-08-30T12:00:00Z",
    referenceId: "pi_3P8f2K2eZvKYlo2C1Gh9m2Nx",
    message: "In honor of Ashton's birthday.",
  },
  {
    id: "don_2002",
    donor: "Community First Church",
    email: "giving@communityfirst.org",
    amount: 1000,
    frequency: "One-time",
    status: "Completed",
    date: "2026-08-29T16:20:00Z",
    referenceId: "pi_3P8f0J1eZvKYlo2C0Fb7l1Wq",
  },
  {
    id: "don_2003",
    donor: "Marcus Reid",
    email: "marcus.reid@example.com",
    amount: 50,
    frequency: "One-time",
    status: "Pending",
    date: "2026-08-29T10:11:00Z",
    referenceId: "pi_3P8ezH0eZvKYlo2C9Da3k0Vp",
  },
  {
    id: "don_2004",
    donor: "Denise Carter",
    email: "denise.carter@example.com",
    amount: 100,
    frequency: "Monthly",
    status: "Completed",
    date: "2026-08-28T09:45:00Z",
    referenceId: "pi_3P8eyG9eZvKYlo2C8Cz2j9Uo",
  },
  {
    id: "don_2005",
    donor: "Anonymous",
    email: "anon-8842@donor.example.com",
    amount: 25,
    frequency: "One-time",
    status: "Failed",
    date: "2026-08-27T21:03:00Z",
    referenceId: "pi_3P8exF8eZvKYlo2C7By1i8Tn",
  },
  {
    id: "don_2006",
    donor: "Jalen Ford",
    email: "jalen.ford@example.com",
    amount: 75,
    frequency: "Monthly",
    status: "Completed",
    date: "2026-08-26T14:30:00Z",
    referenceId: "pi_3P8ewE7eZvKYlo2C6Ax0h7Sm",
  },
  {
    id: "don_2007",
    donor: "Westlake High School PTA",
    email: "pta@westlakehs.example.edu",
    amount: 500,
    frequency: "One-time",
    status: "Refunded",
    date: "2026-08-15T13:00:00Z",
    referenceId: "pi_3P8dgT3eZvKYlo2C5Zw9g6Rl",
    message: "Refunded — duplicate charge from event registration form.",
  },
  {
    id: "don_2008",
    donor: "Amara Okafor",
    email: "amara.okafor@example.com",
    amount: 20,
    frequency: "Monthly",
    status: "Completed",
    date: "2026-08-10T08:15:00Z",
    referenceId: "pi_3P8ceR2eZvKYlo2C4Yv8f5Qk",
  },
]

export function getDonationById(id: string) {
  return donations.find((d) => d.id === id)
}

export function getDonationsByEmail(email: string) {
  return donations.filter((d) => d.email === email)
}
