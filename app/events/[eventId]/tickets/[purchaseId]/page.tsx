import Link from "next/link"
import { notFound } from "next/navigation"
import { z } from "zod"
import { PurchasePage } from "@/components/events-core/public/purchase-page"

export const dynamic = "force-dynamic"
export const metadata = { title: "Your event tickets", robots: { index: false, follow: false }, referrer: "no-referrer" as const }

/** Existing buyers retain this route even when new discovery and paid selling are disabled. */
export default async function TicketPurchasePage({ params }: { params: Promise<{ eventId: string; purchaseId: string }> }) {
  const values = await params
  const eventId = values.eventId, purchaseId = values.purchaseId
  if (!z.string().uuid().safeParse(eventId).success || !z.string().uuid().safeParse(purchaseId).success) notFound()
  return <section className="mx-auto grid w-full max-w-3xl gap-6 px-6 pt-32 pb-24">
    <Link href="/events" className="text-sm underline">← All events</Link>
    <h1 className="font-serif text-3xl">Your event tickets</h1>
    <PurchasePage eventId={eventId} purchaseId={purchaseId} />
  </section>
}
