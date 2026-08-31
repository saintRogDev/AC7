"use server"

import { stripe } from "@/lib/stripe"
import { ALL_DONATIONS } from "@/lib/donations"

export async function startCheckoutSession(donationId: string) {
  const donation = ALL_DONATIONS.find((d) => d.id === donationId)
  if (!donation) {
    throw new Error(`Donation tier with id "${donationId}" not found`)
  }

  const lineItem: Record<string, unknown> = {
    price_data: {
      currency: "usd",
      product_data: {
        name: donation.name,
        description: donation.description,
      },
      unit_amount: donation.priceInCents,
      ...(donation.mode === "subscription" ? { recurring: { interval: "month" as const } } : {}),
    },
    quantity: 1,
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [lineItem as Stripe.Checkout.SessionCreateParams.LineItem],
    mode: donation.mode,
  })

  return session.client_secret
}

export async function startCustomCheckoutSession(amountInCents: number, mode: "payment" | "subscription") {
  if (amountInCents < 100) {
    throw new Error("Minimum donation is $1.00")
  }

  const label = mode === "subscription" ? "Custom Monthly Donation" : "Custom One-Time Donation"
  const description = mode === "subscription"
    ? "A recurring monthly gift to the AC7 Foundation"
    : "A one-time gift to the AC7 Foundation"

  const lineItem: Record<string, unknown> = {
    price_data: {
      currency: "usd",
      product_data: {
        name: label,
        description,
      },
      unit_amount: amountInCents,
      ...(mode === "subscription" ? { recurring: { interval: "month" as const } } : {}),
    },
    quantity: 1,
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [lineItem as Stripe.Checkout.SessionCreateParams.LineItem],
    mode,
  })

  return session.client_secret
}
