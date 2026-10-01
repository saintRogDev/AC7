import { notFound } from "next/navigation"
import { EventsPreview } from "@/components/admin/events/events-preview"

export const metadata = { title: "Events review | AC7 Foundation", robots: { index: false, follow: false } }

export default function EventsPreviewPage() {
  if (process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "development") notFound()
  return <EventsPreview />
}
