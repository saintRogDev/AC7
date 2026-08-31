"use client"

import { useState } from "react"
import { ONE_TIME_DONATIONS, MONTHLY_DONATIONS } from "@/lib/donations"
import { DonationCheckout, CustomDonationCheckout } from "@/components/donation-checkout"

export function DonateForm() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<"one-time" | "monthly">("one-time")
  const [customAmount, setCustomAmount] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const donations = tab === "one-time" ? ONE_TIME_DONATIONS : MONTHLY_DONATIONS

  function handleSelectTier(id: string) {
    setSelectedId(id)
    setShowCustom(false)
    setShowCheckout(false)
  }

  function handleCustom() {
    setSelectedId(null)
    setShowCustom(true)
    setShowCheckout(false)
  }

  function handleProceed() {
    if (selectedId || (showCustom && customAmount)) {
      setShowCheckout(true)
    }
  }

  function handleBack() {
    setShowCheckout(false)
  }

  const customCents = Math.round(parseFloat(customAmount) * 100)
  const isValidCustom = showCustom && !isNaN(customCents) && customCents >= 100

  if (showCheckout) {
    return (
      <div className="bg-card p-8 rounded-sm">
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 flex items-center gap-1"
        >
          <span aria-hidden="true">&larr;</span> Back to donation options
        </button>
        {selectedId ? (
          <DonationCheckout donationId={selectedId} />
        ) : (
          <CustomDonationCheckout
            amountInCents={customCents}
            mode={tab === "monthly" ? "subscription" : "payment"}
          />
        )}
      </div>
    )
  }

  return (
    <div className="bg-card p-8 rounded-sm">
      {/* Tabs */}
      <div className="flex border-b border-border mb-8">
        <button
          type="button"
          onClick={() => { setTab("one-time"); setSelectedId(null); setShowCustom(false) }}
          className={`pb-3 px-6 text-sm tracking-wide transition-colors ${
            tab === "one-time"
              ? "border-b-2 border-accent text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          One-Time Gift
        </button>
        <button
          type="button"
          onClick={() => { setTab("monthly"); setSelectedId(null); setShowCustom(false) }}
          className={`pb-3 px-6 text-sm tracking-wide transition-colors ${
            tab === "monthly"
              ? "border-b-2 border-accent text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly Giving
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {tab === "one-time"
          ? "Make an immediate impact with a single contribution. Every dollar goes directly toward supporting our mission and programs."
          : "Join our community of sustaining supporters. Monthly gifts provide reliable funding that allows us to plan and grow our programs."}
      </p>

      {/* Amount Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {donations.map((tier) => (
          <button
            key={tier.id}
            type="button"
            onClick={() => handleSelectTier(tier.id)}
            className={`py-3 border text-sm rounded-sm transition-colors ${
              selectedId === tier.id
                ? "border-accent bg-accent/10 text-foreground font-medium"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <button
        type="button"
        onClick={handleCustom}
        className={`w-full py-3 border text-sm rounded-sm transition-colors mb-6 ${
          showCustom
            ? "border-accent bg-accent/10 text-foreground font-medium"
            : "border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        Custom Amount
      </button>

      {showCustom && (
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-border rounded-sm bg-background text-foreground text-sm focus:outline-none focus:border-accent"
            />
          </div>
          {customAmount && !isValidCustom && (
            <p className="text-xs text-destructive mt-2">Minimum donation is $1.00</p>
          )}
        </div>
      )}

      {/* Proceed Button */}
      <button
        type="button"
        onClick={handleProceed}
        disabled={!selectedId && !isValidCustom}
        className="w-full bg-accent text-accent-foreground py-3 text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {tab === "one-time" ? "Donate Now" : "Become a Monthly Donor"}
      </button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Secure payment powered by Stripe
        {tab === "monthly" && " \u00B7 Cancel or adjust anytime"}
      </p>
    </div>
  )
}
