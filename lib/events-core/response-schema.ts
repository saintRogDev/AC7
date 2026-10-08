import { z } from "zod"

const uuid = z.string().uuid()
const token = z.string().regex(/^[A-Za-z0-9_-]{43}$/)
const event = z.object({
  id: uuid, title: z.string(), slug: z.string(), description: z.string().nullable(),
  image_url: z.string().nullable(), location: z.string().nullable(),
  starts_at: z.string().datetime({ offset: true }), ends_at: z.string().datetime({ offset: true }),
  capacity: z.number().int().positive().nullable(), status: z.enum(["draft", "published", "cancelled"]),
})
const confirmation = z.discriminatedUnion("replayed", [
  z.object({ id: uuid, replayed: z.literal(false), token }),
  z.object({ id: uuid, replayed: z.literal(true), token: z.null() }),
])
const attendee = z.object({
  id: uuid, guest_info: z.object({ name: z.string(), email: z.string() }), status: z.string(),
  created_at: z.string(), checked_in_at: z.string().nullable(),
  staff_registered_by: uuid.nullable(), staff_registered_at: z.string().nullable(),
})

/** Runtime contract checks: malformed success must never appear as healthy UI. */
export function validateEventsResponse(path: string, method: string, data: unknown): boolean {
  let schema: z.ZodTypeAny
  if (path === "/v1/admin/session") schema = z.object({ organization: z.object({ slug: z.string() }), staff: z.object({ role: z.string() }) })
  else if (path.endsWith("/check-in")) schema = z.object({ id: uuid, checked_in_at: z.string().nullable(), already_checked_in: z.boolean() })
  else if (path.endsWith("/attendees")) schema = z.object({ attendees: z.array(attendee), next_cursor: uuid.nullable() })
  else if (path.endsWith("/registrations/confirm") || (path.startsWith("/v1/admin/") && path.endsWith("/registrations"))) schema = confirmation
  else if (path.endsWith("/registrations")) schema = z.object({ status: z.literal("verification_required") })
  else if (method !== "GET") schema = z.object({ id: uuid })
  else if (path === "/v1/events" || path === "/v1/admin/events") schema = z.object({ events: z.array(event), next_cursor: uuid.nullable() })
  else schema = event
  return schema.safeParse(data).success
}
