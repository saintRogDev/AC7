"use client"

import { useCallback } from "react"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

import { startCheckoutSession, startCustomCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function DonationCheckout({ donationId }: { donationId: string }) {
  const fetchClientSecret = useCallback(
    () => startCheckoutSession(donationId),
    [donationId],
  )

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export function CustomDonationCheckout({
  amountInCents,
  mode,
}: {
  amountInCents: number
  mode: "payment" | "subscription"
}) {
  const fetchClientSecret = useCallback(
    () => startCustomCheckoutSession(amountInCents, mode),
    [amountInCents, mode],
  )

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
