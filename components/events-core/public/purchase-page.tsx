"use client"
import { PaidTickets } from "./paid-tickets"
import { serverPaidAdapter } from "@/lib/events-core/paid-server-adapter"
export function PurchasePage({ eventId, purchaseId }: { eventId: string; purchaseId: string }) {
  return <PaidTickets key={`${eventId}:${purchaseId}`} eventId={eventId} purchaseId={purchaseId} adapter={serverPaidAdapter} eventHref={`/events/${eventId}`} />
}
