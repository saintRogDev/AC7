import { createClient } from "@/lib/supabase/server"
import { createInviteConfirmationHandlers } from "@east-saint/staff-invitations-client/confirmation"
import { isUnavailableAuthError } from "@east-saint/staff-invitations-client/auth-errors"

const handlers = createInviteConfirmationHandlers(async (token_hash) => {
  const { error } = await (await createClient()).auth.verifyOtp({ token_hash, type: "invite" })
  return !error ? "accepted" : isUnavailableAuthError(error) ? "unavailable" : "invalid"
}, { siteName: "AC7 Foundation" })
export const GET = handlers.GET
export const POST = handlers.POST
