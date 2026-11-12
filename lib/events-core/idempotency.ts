export { newIdempotencyKey } from "@east-saint/events-client"

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
