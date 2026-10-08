/**
 * Pure deployment mapping for the shared East Saint Platform API.
 *
 * Kept free of `server-only` and of any environment read so the rules can be
 * unit-tested directly. The single source of truth for "which organization is
 * this deployment allowed to be" lives here, hard-coded, and is never taken
 * from a caller, a browser, or a value the API echoes back. The API's answer is
 * only ever *compared* against these expectations (see lib/platform/application.ts).
 */

export const PLATFORM_ENVIRONMENTS = ["production", "preview", "development"] as const

export type PlatformEnvironment = (typeof PLATFORM_ENVIRONMENTS)[number]

/**
 * AC7's fixed environment -> organization slug mapping.
 *
 * Production is the only environment that touches real AC7 applications.
 * Preview and local development are pinned to the sandbox organization so test
 * submissions can never land in the live AC7 ledger.
 */
export const AC7_ENVIRONMENT_ORG_SLUG: Record<PlatformEnvironment, string> = {
  production: "ac7",
  preview: "ac7-sandbox",
  development: "ac7-sandbox",
}

/**
 * The environment this deployment must identify as, derived from Vercel's
 * server-only `VERCEL_ENV`. A missing value means we are not on Vercel at all
 * (local development), which maps to the sandbox — never to production.
 */
export function expectedEnvironment(vercelEnv: string | undefined): PlatformEnvironment {
  if (vercelEnv === "production") return "production"
  if (vercelEnv === "preview") return "preview"
  return "development"
}

/** The organization slug this deployment's environment is allowed to be. */
export function expectedOrgSlug(environment: PlatformEnvironment): string {
  return AC7_ENVIRONMENT_ORG_SLUG[environment]
}
