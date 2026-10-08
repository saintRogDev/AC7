type AuthenticationMethod = {
  method?: unknown
  timestamp?: unknown
}

export function isInviteSession(amr: unknown) {
  if (!Array.isArray(amr) || amr.length === 0) return false

  const methods = amr.filter((entry): entry is AuthenticationMethod => (
    typeof entry === "object"
    && entry !== null
    && typeof entry.method === "string"
    && typeof entry.timestamp === "number"
    && Number.isFinite(entry.timestamp)
  ))
  if (methods.length !== amr.length) return false

  const latest = methods.reduce((current, entry) => (
    entry.timestamp as number > (current.timestamp as number) ? entry : current
  ))
  return latest.method === "otp"
}
