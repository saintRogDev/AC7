import "server-only"

import { estlEventsRequest as request } from "./estl-events-core"
import type { EstlResult } from "@/lib/events-core/types"

type Options = Omit<Parameters<typeof request>[0], "environment" | "fetchImplementation">

/**
 * Server-only binding. Credentials are read here and nowhere else, so no route,
 * action or component ever touches process.env for ESTL configuration.
 */
export function estlEventsRequest<T>(options: Options): Promise<EstlResult<T>> {
  return request<T>({
    ...options,
    environment: {
      EAST_SAINT_PLATFORM_API_URL: process.env.EAST_SAINT_PLATFORM_API_URL,
      EAST_SAINT_SITE_KEY: process.env.EAST_SAINT_SITE_KEY,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  })
}

export { eventsMessages } from "./estl-events-core"
