// Time formatting kept separate from branding so AC7 (or any tenant) can reuse
// the same component behavior with different labels. All formatters tolerate
// missing/invalid legacy values without inventing data.

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | null | undefined, timeZone?: string): string {
  const date = toDate(value)
  if (!date) return "Date to be announced"
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(date)
}

export function formatTime(value: string | null | undefined, timeZone?: string): string {
  const date = toDate(value)
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(date)
}

/** Human date + time range with an explicit timezone label. */
export function formatEventWhen(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  timeZone?: string,
): string {
  const start = toDate(startsAt)
  if (!start) return "Date to be announced"
  const datePart = formatDate(startsAt, timeZone)
  const startTime = formatTime(startsAt, timeZone)
  const end = toDate(endsAt)
  if (!end) return `${datePart} · ${startTime}`
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  if (sameDay) {
    const endTime = formatTime(endsAt, timeZone)
    return `${datePart} · ${startTime} – ${endTime}`
  }
  return `${datePart} · ${startTime} → ${formatDate(endsAt, timeZone)} · ${formatTime(endsAt, timeZone)}`
}

export function formatTimestamp(value: string | null | undefined, timeZone?: string): string {
  const date = toDate(value)
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date)
}

export function hasEnded(endsAt: string | null | undefined): boolean {
  const date = toDate(endsAt)
  if (!date) return false
  return date.getTime() < Date.now()
}

/**
 * Serialize a value from a datetime-local input plus an explicit offset into a
 * real ISO timestamp. Never blindly append "Z" to a local wall-clock value.
 * @param local  "YYYY-MM-DDTHH:mm" from an <input type="datetime-local">
 * @param offset e.g. "-05:00" — the offset the operator selected
 */
export function localInputToIso(local: string, offset: string): string | null {
  if (!local) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!match) return null
  const normalizedOffset = offset === "Z" ? "+00:00" : offset
  const candidate = `${local}:00${normalizedOffset}`
  const date = new Date(candidate)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

/** Convert an ISO timestamp back to the "YYYY-MM-DDTHH:mm" a local input wants. */
export function isoToLocalInput(iso: string | null | undefined, offset: string): string {
  const date = toDate(iso)
  if (!date) return ""
  const sign = offset.startsWith("-") ? -1 : 1
  const [h, m] = offset.replace(/^[+-]/, "").split(":").map((n) => Number.parseInt(n, 10))
  const offsetMinutes = sign * ((h || 0) * 60 + (m || 0))
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000)
  return shifted.toISOString().slice(0, 16)
}

/** Common US timezone offset choices for the admin form. Advisory labels only. */
export const TIMEZONE_OFFSETS = [
  { value: "-04:00", label: "Eastern (UTC−04:00)" },
  { value: "-05:00", label: "Eastern Standard (UTC−05:00)" },
  { value: "-05:00-central-dst", label: "Central (UTC−05:00)" },
  { value: "-06:00", label: "Central Standard (UTC−06:00)" },
  { value: "-07:00", label: "Mountain (UTC−07:00)" },
  { value: "-08:00", label: "Pacific (UTC−08:00)" },
  { value: "+00:00", label: "UTC (UTC+00:00)" },
] as const
