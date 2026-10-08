// Idempotency + token utilities.
//
// Generate a cryptographically random UUID v4 once per new submission intent,
// reuse it for network retries of the SAME unchanged payload, and create a new
// key only for a deliberate resend after cooldown or a changed payload. Never
// derive the key from name/email/event and never auto-loop new keys.

export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  // Fallback for older runtimes: RFC-4122 v4 from getRandomValues.
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

/**
 * Demo-only opaque token generator producing a 43-char base64url string that
 * matches ^[A-Za-z0-9_-]{43}$. Real tokens are minted server-side; this only
 * feeds synthetic fixtures.
 */
export function newDemoToken(): string {
  const bytes = new Uint8Array(43)
  crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    out += BASE64URL[bytes[i] % 64]
  }
  return out
}
