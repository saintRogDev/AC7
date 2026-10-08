import { expectedEnvironment, expectedOrgSlug } from "@/lib/platform/deployment"
export const AC7_PRODUCTION_ORG_SLUG = "ac7"
export const AC7_SANDBOX_ORG_SLUG = "ac7-sandbox"
export function resolveAc7AdminOrgSlug(vercelEnvironment: string | undefined) { return expectedOrgSlug(expectedEnvironment(vercelEnvironment)) }
