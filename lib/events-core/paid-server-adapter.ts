"use client"

import { createPaidEventsPublicAdapter, matchPaidEventsRoute } from "@east-saint/events-client/paid"
import { paidEventAction } from "@/app/events/actions"

/** Browser calls server actions; site credentials and source attribution stay server-side. */
export const serverPaidAdapter = createPaidEventsPublicAdapter(request => {
  const match = matchPaidEventsRoute(request.path, request.method)
  if (!match) return Promise.resolve({ error: { code: "VALIDATION", message: "Invalid ticket request." } })
  return paidEventAction(match.operation, { ...match.scope, body: request.body ?? {} })
})
