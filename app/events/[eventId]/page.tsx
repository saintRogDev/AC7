import { notFound } from "next/navigation"



import { PublicEventDetail } from "./event-detail-client"
import { estlEventsPublicEnabled } from "@/lib/estl-events-flags"

export const metadata = {
  title: "Gathering | AC7 Foundation",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function EstlEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  if (!estlEventsPublicEnabled()) notFound()
  const { eventId } = await params

  return (
    <div className="min-h-screen bg-background">

      <section className="mx-auto w-full max-w-4xl px-6 pt-32 pb-24 lg:px-8">
        <PublicEventDetail eventId={eventId} />
      </section>

    </div>
  )
}
