import { estlEventsPublicEnabled } from "@/lib/estl-events-flags"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
export default function EventsLayout({children}:{children:React.ReactNode}) { return <><Navigation eventsEnabled={estlEventsPublicEnabled()} />{children}<Footer /></> }
