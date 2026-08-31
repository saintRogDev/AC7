export interface DonationTier {
  id: string
  name: string
  description: string
  priceInCents: number
  mode: "payment" | "subscription"
  label: string
}

export const ONE_TIME_DONATIONS: DonationTier[] = [
  {
    id: "one-time-25",
    name: "One-Time Donation - $25",
    description: "A one-time gift to the AC7 Foundation",
    priceInCents: 2500,
    mode: "payment",
    label: "$25",
  },
  {
    id: "one-time-50",
    name: "One-Time Donation - $50",
    description: "A one-time gift to the AC7 Foundation",
    priceInCents: 5000,
    mode: "payment",
    label: "$50",
  },
  {
    id: "one-time-100",
    name: "One-Time Donation - $100",
    description: "A one-time gift to the AC7 Foundation",
    priceInCents: 10000,
    mode: "payment",
    label: "$100",
  },
  {
    id: "one-time-250",
    name: "One-Time Donation - $250",
    description: "A one-time gift to the AC7 Foundation",
    priceInCents: 25000,
    mode: "payment",
    label: "$250",
  },
  {
    id: "one-time-500",
    name: "One-Time Donation - $500",
    description: "A one-time gift to the AC7 Foundation",
    priceInCents: 50000,
    mode: "payment",
    label: "$500",
  },
  {
    id: "one-time-1000",
    name: "One-Time Donation - $1,000",
    description: "A one-time gift to the AC7 Foundation",
    priceInCents: 100000,
    mode: "payment",
    label: "$1,000",
  },
]

export const MONTHLY_DONATIONS: DonationTier[] = [
  {
    id: "monthly-10",
    name: "Monthly Donation - $10/mo",
    description: "A recurring monthly gift to the AC7 Foundation",
    priceInCents: 1000,
    mode: "subscription",
    label: "$10/mo",
  },
  {
    id: "monthly-25",
    name: "Monthly Donation - $25/mo",
    description: "A recurring monthly gift to the AC7 Foundation",
    priceInCents: 2500,
    mode: "subscription",
    label: "$25/mo",
  },
  {
    id: "monthly-50",
    name: "Monthly Donation - $50/mo",
    description: "A recurring monthly gift to the AC7 Foundation",
    priceInCents: 5000,
    mode: "subscription",
    label: "$50/mo",
  },
  {
    id: "monthly-100",
    name: "Monthly Donation - $100/mo",
    description: "A recurring monthly gift to the AC7 Foundation",
    priceInCents: 10000,
    mode: "subscription",
    label: "$100/mo",
  },
  {
    id: "monthly-250",
    name: "Monthly Donation - $250/mo",
    description: "A recurring monthly gift to the AC7 Foundation",
    priceInCents: 25000,
    mode: "subscription",
    label: "$250/mo",
  },
  {
    id: "monthly-500",
    name: "Monthly Donation - $500/mo",
    description: "A recurring monthly gift to the AC7 Foundation",
    priceInCents: 50000,
    mode: "subscription",
    label: "$500/mo",
  },
]

export const ALL_DONATIONS = [...ONE_TIME_DONATIONS, ...MONTHLY_DONATIONS]
