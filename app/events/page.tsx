import { notFound } from "next/navigation"
import { PublicEventsList } from "./events-list-client"
import { estlEventsPublicEnabled } from "@/lib/estl-events-flags"
export const dynamic = "force-dynamic"
export const metadata = { title: "Events | AC7 Foundation" }
export default function EventsPage() {
  if (!estlEventsPublicEnabled()) notFound()
  return <section className="mx-auto max-w-6xl px-6 py-24"><h1 className="mb-6 font-serif text-4xl">Community events</h1><p className="mb-10 text-muted-foreground">Connect, learn, and grow with AC7 Foundation.</p><PublicEventsList /></section>
}
