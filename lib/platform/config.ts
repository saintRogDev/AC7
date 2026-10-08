/**
 * Pure parsing of this deployment's shared-platform settings.
 *
 * No `server-only` import and no direct `process.env` read here so the rules
 * stay unit-testable. The server-only reader that binds these to `process.env`
 * lives in lib/platform/client.ts.
 *
 * These settings are ALWAYS server-only. None of them may ever be renamed with
 * a NEXT_PUBLIC_ prefix — the site key in particular must never reach a browser
 * bundle.
 */

import {
  expectedEnvironment,
  expectedOrgSlug,
  type PlatformEnvironment,
} from "@/lib/platform/deployment"

const SITE_KEY_PATTERN = /^esk_(prod|prev|dev)_[A-Za-z0-9_-]{11}_[A-Za-z0-9_-]{43}$/

export type PlatformConfig = {
  apiUrl: string
  siteKey: string
  /** The environment this deployment must prove it is, from VERCEL_ENV. */
  environment: PlatformEnvironment
  /** The organization slug this environment is allowed to map to. */
  expectedOrgSlug: string
}

export type PlatformConfigResult =
  | { ok: true; config: PlatformConfig }
  | { ok: false; reason: "unconfigured"; missing: string[] }
  | { ok: false; reason: "invalid"; detail: string }

function normalizeApiUrl(value: string): string | null {
  try {
    const url = new URL(value)
    const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname)

    if (url.protocol !== "https:" && !localHttp) return null
    if (url.username || url.password || url.search || url.hash) return null
    if (url.pathname !== "/") return null

    return url.origin
  } catch {
    return null
  }
}

/**
 * Validate the server-only API settings for this deployment.
 *
 * A missing URL or key is reported as "unconfigured" with the exact names, so a
 * developer sees what to add. A present-but-malformed value is "invalid". Both
 * are treated as fail-closed by callers; neither detail is ever shown to a
 * production visitor.
 */
export function parsePlatformConfig(env: Record<string, string | undefined>): PlatformConfigResult {
  const apiUrl = env.EAST_SAINT_PLATFORM_API_URL?.trim()
  const siteKey = env.EAST_SAINT_SITE_KEY?.trim()

  const missing = [!apiUrl && "EAST_SAINT_PLATFORM_API_URL", !siteKey && "EAST_SAINT_SITE_KEY"].filter(
    (entry): entry is string => Boolean(entry),
  )

  if (missing.length > 0) {
    return { ok: false, reason: "unconfigured", missing }
  }

  const normalizedApiUrl = normalizeApiUrl(apiUrl!)
  if (!normalizedApiUrl) {
    return {
      ok: false,
      reason: "invalid",
      detail: "EAST_SAINT_PLATFORM_API_URL must be an HTTPS origin, or local HTTP during development.",
    }
  }

  if (!SITE_KEY_PATTERN.test(siteKey!)) {
    return { ok: false, reason: "invalid", detail: "EAST_SAINT_SITE_KEY is not a valid site key." }
  }

  const environment = expectedEnvironment(env.VERCEL_ENV)

  return {
    ok: true,
    config: {
      apiUrl: normalizedApiUrl,
      siteKey: siteKey!,
      environment,
      expectedOrgSlug: expectedOrgSlug(environment),
    },
  }
}
