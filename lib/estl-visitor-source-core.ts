import { isIP } from "node:net"

/**
 * Visitor address attribution for public Events requests.
 *
 * ESTL limits verification requests per visitor source, and it can only learn
 * the visitor's address from this server: from ESTL's side every request comes
 * from AC7's own egress. The value forwarded here is therefore trusted upstream
 * purely because it travels with the server-only site credential, so it must
 * come from infrastructure AC7 itself trusts — never from a header the browser
 * could have supplied.
 *
 * On Vercel (`production` / `preview` deployments) `x-forwarded-for` is
 * overwritten by the platform with the connecting client's public IP and
 * external values are not forwarded, which is what makes it usable. Outside
 * those deployments no header is trustworthy, so local work is attributed to
 * loopback and shares one bucket.
 */

const LOOPBACK = "127.0.0.1"

type HeaderReader = { get(name: string): string | null }

export function readVisitorSourceIp(headers: HeaderReader, vercelEnvironment: string | undefined): string | null {
  if (vercelEnvironment !== "production" && vercelEnvironment !== "preview") return LOOPBACK
  const forwarded = headers.get("x-forwarded-for")
  if (!forwarded) return null
  // The platform writes the header; if anything ever appended to it, the
  // right-most entry is the one added by the last trusted hop.
  const candidate = forwarded.split(",").at(-1)?.trim() ?? ""
  return isIP(candidate) ? candidate : null
}
