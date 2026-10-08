import "server-only"
import { sendInvitationToEstl as send } from "@east-saint/staff-invitations-client/server"
import type { InvitationInput } from "@east-saint/staff-invitations-client"
import { expectedEnvironment, expectedOrgSlug } from "@/lib/platform/deployment"

export function sendInvitationToEstl(input: InvitationInput, token: string, expectedOrg: string) {
  const environment = expectedEnvironment(process.env.VERCEL_ENV)
  if (expectedOrg !== expectedOrgSlug(environment)) return Promise.resolve({ status: "forbidden" as const })
  return send(input, token, expectedOrg, process.env, {
    credentialVariable: "EAST_SAINT_SITE_KEY",
    expectedEnvironment: environment,
    approvedApiOrigin: "https://east-saint-platform-api.vercel.app",
  })
}
