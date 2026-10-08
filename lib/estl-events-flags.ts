import "server-only"

/** Public Events stays closed until the deployment is explicitly enabled. */
export function estlEventsPublicEnabled(environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment.ESTL_EVENTS_PUBLIC_ENABLED === "true"
}
