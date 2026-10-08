// ESTL core contract types (frontend-only mirror of the authoritative API).
// Codex owns the real server adapters; these types describe the shapes the UI
// consumes so demo and real adapters stay interchangeable.

export type EventStatus = "draft" | "published" | "cancelled"

/**
 * The complete editable event model. Detail requests are addressed by `id`
 * (UUID), never by slug. There is intentionally NO public remaining-seats,
 * attendance count, category, price, recurrence, sold-out or waitlist field.
 */
export interface EventCore {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  location: string | null
  starts_at: string
  ends_at: string
  capacity: number | null
  status: EventStatus
}

/** Editable model sent to POST/PUT admin events. PUT replaces the whole model. */
export interface EventInput {
  title: string
  slug: string
  starts_at: string
  ends_at: string
  status: EventStatus
  description: string | null
  image_url: string | null
  location: string | null
  capacity: number | null
}

export interface Attendee {
  id: string
  guest_info: { name: string; email: string }
  status: string
  created_at: string
  checked_in_at: string | null
  /** Creator UUID. Not a display name; render a discreet audit identifier only. */
  staff_registered_by: string | null
  staff_registered_at: string | null
}

export interface EventListPage {
  events: EventCore[]
  next_cursor: string | null
}

export interface AttendeeListPage {
  attendees: Attendee[]
  next_cursor: string | null
}

/** Acknowledges a registration request only. Never infer success/membership. */
export interface RegistrationAck {
  status: "verification_required"
}

/**
 * Confirmation result. A fresh registration returns replayed:false with a
 * 43-char base64url ticket token. A replay returns replayed:true, token:null.
 */
export interface ConfirmResult {
  id: string
  replayed: boolean
  token: string | null
}

export interface CheckInResult {
  id: string
  checked_in_at: string | null
  /** Server state before this operation, decided under the registration lock. */
  already_checked_in: boolean
}

export type EstlErrorCode =
  | "UNAUTHORIZED" // 401
  | "FORBIDDEN" // 403
  | "EVENT_NOT_FOUND" // 404
  | "EVENT_CAPACITY" // 409
  | "EVENT_CONFLICT" // 409
  | "VALIDATION" // 422
  | "BAD_REQUEST" // 400
  | "PAYLOAD_TOO_LARGE" // 413
  | "RATE_LIMITED" // 429
  | "UNAVAILABLE" // 503

export interface EstlError {
  code: EstlErrorCode | string
  message: string
  /** Seconds until a RATE_LIMITED request may be retried, when ESTL supplied it. */
  retryAfterSeconds?: number
}

export type EstlResult<T> = { data: T } | { error: EstlError }

export function isEstlError<T>(result: EstlResult<T>): result is { error: EstlError } {
  return "error" in result
}

export function isEstlData<T>(result: EstlResult<T>): result is { data: T } {
  return "data" in result
}

// Ticket / proof tokens are distinct 43-character case-sensitive base64url strings.
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function isValidToken(value: string): boolean {
  return TOKEN_PATTERN.test(value)
}
