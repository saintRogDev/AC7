"use client"

import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RotateCcw, ShieldAlert } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { getDonationById, getDonationsByEmail } from "@/lib/admin/mock/donations"
import { formatCurrency, formatDateTime } from "@/lib/admin/format"
import { toast } from "sonner"

export default function DonationDetailPage() {
  const params = useParams<{ id: string }>()
  const donation = getDonationById(params.id)
  if (!donation) notFound()

  const history = getDonationsByEmail(donation.email).filter((d) => d.id !== donation.id)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <AdminPageHeader
        title={donation.donor}
        breadcrumbs={[{ label: "Donations", href: "/admin/donations" }, { label: donation.referenceId }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/donations">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Refunds are processed through Stripe and aren't connected in this demo"
              onClick={() => toast.info("Refunds aren't connected in this demo.")}
            >
              <RotateCcw className="size-4" />
              Refund (not connected)
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <StatusBadge status={donation.status} />
          <span className="text-2xl font-semibold text-foreground">{formatCurrency(donation.amount)}</span>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Donor" value={donation.donor} />
          <Field label="Email" value={donation.email} />
          <Field label="Frequency" value={donation.frequency} />
          <Field label="Payment status" value={donation.status} />
          <Field label="Provider reference" value={<span className="font-mono text-xs">{donation.referenceId}</span>} />
          <Field label="Created" value={formatDateTime(donation.date)} />
        </dl>

        {donation.message && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Note from donor</span>
            <p className="text-sm leading-relaxed text-foreground">{donation.message}</p>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>Card numbers and other sensitive payment details are never shown here — they stay with Stripe.</span>
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Donation History for This Donor</h2>
          </div>
          <ul className="divide-y divide-border">
            {history.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/admin/donations/${d.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-foreground">{formatCurrency(d.amount)}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(d.date)}</span>
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}
