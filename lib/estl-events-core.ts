import { parsePlatformConfig } from "@/lib/platform/config"
import { validateEventsResponse } from "@/lib/events-core/response-schema"
import type { EstlError, EstlResult } from "./events-core/types.ts"

const SITE_KEY_HEADER = "x-east-saint-site-key"
/** Visitor address attribution for public registration; see estl-visitor-source-core. */
const SOURCE_IP_HEADER = "x-east-saint-source-ip"
const READ_TIMEOUT_MS = 10_000
const WRITE_TIMEOUT_MS = 20_000

type Environment = Record<string, string | undefined>
type Fetch = typeof fetch

/** Manager/admin only. AC7's Forms admin also admits `reviewer`; Events must not. */
export const EVENTS_STAFF_ROLES = new Set(["admin", "manager"])

function estlError(code: EstlError["code"], message: string): { error: EstlError } {
  return { error: { code, message } }
}

export const eventsMessages = {
  UNAUTHORIZED: "Your session has expired. Sign in again.",
  FORBIDDEN: "Your staff role does not include Events access.",
  EVENT_NOT_FOUND: "That event is unavailable.",
  EVENT_CAPACITY: "This event is full.",
  EVENT_CONFLICT: "That request conflicts with an existing registration.",
  VALIDATION: "Check the highlighted fields and try again.",
  BAD_REQUEST: "That request could not be processed.",
  PAYLOAD_TOO_LARGE: "That request was too large.",
  RATE_LIMITED: "Too many requests from your network right now. Please wait before trying again.",
  UNAVAILABLE: "Events are temporarily unavailable. Try again shortly.",
  NOT_CONFIGURED: "Events are not configured for this site. Contact your site administrator.",
} as const

/**
 * Reads the server-only ESTL credentials. The base URL is validated to a bare
 * HTTPS origin so a misconfigured value cannot redirect the site key elsewhere.
 */
function readConfiguration(environment: Environment) {
  const parsed = parsePlatformConfig(environment)
  if (!parsed.ok || !parsed.config.apiUrl.startsWith("https://")) return null
  return { ...parsed.config, base: new URL(parsed.config.apiUrl) }
}

/** Retry guidance from ESTL, bounded so a bad header cannot produce an absurd wait. */
function readRetryAfterSeconds(response: Response): number | undefined {
  const value = response.headers.get("retry-after")?.trim()
  if (!value || !/^\d{1,4}$/.test(value)) return undefined
  const seconds = Number(value)
  return seconds >= 1 ? seconds : undefined
}

export function rateLimitedMessage(retryAfterSeconds: number | undefined): string {
  if (!retryAfterSeconds) return eventsMessages.RATE_LIMITED
  const minutes = Math.ceil(retryAfterSeconds / 60)
  return `Too many requests from your network right now. Try again in about ${minutes === 1 ? "a minute" : `${minutes} minutes`}.`
}

/** Maps ESTL transport failures onto the UI's closed error vocabulary. */
function mapFailure(status: number, body: unknown, response?: Response): { error: EstlError } {
  const code = (body as { error?: { code?: unknown } } | null)?.error?.code
  if (status === 429) {
    const retryAfterSeconds = response ? readRetryAfterSeconds(response) : undefined
    return {
      error: {
        code: "RATE_LIMITED",
        message: rateLimitedMessage(retryAfterSeconds),
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
      },
    }
  }
  if (status === 401) return estlError("UNAUTHORIZED", eventsMessages.UNAUTHORIZED)
  if (status === 403) return estlError("FORBIDDEN", eventsMessages.FORBIDDEN)
  if (status === 404) return estlError("EVENT_NOT_FOUND", eventsMessages.EVENT_NOT_FOUND)
  if (status === 409) {
    return code === "EVENT_CAPACITY"
      ? estlError("EVENT_CAPACITY", eventsMessages.EVENT_CAPACITY)
      : estlError("EVENT_CONFLICT", eventsMessages.EVENT_CONFLICT)
  }
  if (status === 422) return estlError("VALIDATION", eventsMessages.VALIDATION)
  if (status === 413) return estlError("PAYLOAD_TOO_LARGE", eventsMessages.PAYLOAD_TOO_LARGE)
  if (status === 400) return estlError("BAD_REQUEST", eventsMessages.BAD_REQUEST)
  return estlError("UNAVAILABLE", eventsMessages.UNAVAILABLE)
}

type RequestOptions = {
  path: string
  method?: "GET" | "POST" | "PUT"
  body?: unknown
  /** Staff bearer token. Its presence selects the authenticated transport. */
  token?: string
  /** Trusted visitor address for public registration requests. */
  sourceIp?: string
  /** Required: the core never reaches for ambient configuration of its own. */
  environment: Environment
  fetchImplementation?: Fetch
}

/**
 * Single egress point to ESTL Events. The site key never leaves the server and
 * is never exposed to the browser. A failure here is always surfaced as an
 * error result — it must never fall back to demo fixtures or Sheet data.
 */
export async function estlEventsRequest<T>({
  path,
  method = "GET",
  body,
  token,
  sourceIp,
  environment,
  fetchImplementation = fetch,
}: RequestOptions): Promise<EstlResult<T>> {
  const configuration = readConfiguration(environment)
  if (!configuration) return estlError("NOT_CONFIGURED", eventsMessages.NOT_CONFIGURED)

  // Reject absolute paths, traversal, and unexpected endpoints before credentials leave the server.
  const target = new URL(path, configuration.base)
  if (target.origin !== configuration.base.origin || !/^\/v1\/(?:events(?:\/|$)|admin\/(?:events(?:\/|$)|session$))/.test(target.pathname)) {
    return estlError("BAD_REQUEST", eventsMessages.BAD_REQUEST)
  }
  try {
    const contextResponse = await fetchImplementation(new URL("/v1/site-context", configuration.base), {
      headers: { [SITE_KEY_HEADER]: configuration.siteKey }, cache: "no-store", redirect: "error",
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    })
    const context = (await contextResponse.json())?.data
    if (!contextResponse.ok || context?.organization?.slug !== configuration.expectedOrgSlug ||
        context?.client?.environment !== configuration.environment || typeof context?.organization?.id !== "string") {
      return estlError("FORBIDDEN", eventsMessages.FORBIDDEN)
    }
  } catch {
    return estlError("UNAVAILABLE", eventsMessages.UNAVAILABLE)
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    [SITE_KEY_HEADER]: configuration.siteKey,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (sourceIp) headers[SOURCE_IP_HEADER] = sourceIp
  if (body !== undefined) headers["content-type"] = "application/json"

  let response: Response
  try {
    response = await fetchImplementation(new URL(path, configuration.base), {
      method,
      headers,
      cache: "no-store",
      redirect: "error",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(method === "GET" ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS),
    })
  } catch {
    return estlError("UNAVAILABLE", eventsMessages.UNAVAILABLE)
  }

  let parsed: unknown = null
  try {
    parsed = await response.json()
  } catch {
    parsed = null
  }

  if (!response.ok) return mapFailure(response.status, parsed, response)

  const data = (parsed as { data?: unknown } | null)?.data
  // A missing or null envelope is a failure, never an empty success: callers
  // destructure this and would otherwise render a blank, healthy-looking page.
  if (!validateEventsResponse(target.pathname, method, data)) return estlError("UNAVAILABLE", eventsMessages.UNAVAILABLE)
  return { data: data as T }
}
