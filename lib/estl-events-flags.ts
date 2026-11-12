import "server-only"

/** Public Events stays closed until the deployment is explicitly enabled. */
export function estlEventsPublicEnabled(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.ESTL_EVENTS_PUBLIC_ENABLED === "true"
}

/** Separate rollout switch: installing the package alone never enables paid UI. */
export function estlPaidEventsUiEnabled(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.ESTL_EVENTS_PAID_UI_ENABLED === "true"
}
