import { validateEventsResponse as validateFreeEventsResponse } from "@east-saint/events-client"
import { matchPaidEventsRoute, validatePaidEventsResponse, eventOfferingSchema, paidEventSalesSchema } from "@east-saint/events-client/paid"

/** Paid responses never pass through the legacy generic mutation validator. */
export function validateEventsResponse(path: string, method: string, data: unknown): boolean {
  if (matchPaidEventsRoute(path,method)) return validatePaidEventsResponse(path,method,data)
  const managed=/^\/v1\/admin\/events\/([0-9a-f-]{36})\/(ticket-offering|purchases)$/i.exec(path)
  if(managed && method==='GET') {
    if(managed[2]==='ticket-offering') {const parsed=eventOfferingSchema.safeParse(data);return parsed.success && parsed.data.event_id===managed[1]}
    const parsed=paidEventSalesSchema.safeParse(data)
    return parsed.success && parsed.data.purchases.every(p=>p.event_id===managed[1])
  }
  return validateFreeEventsResponse(path,method,data)
}
