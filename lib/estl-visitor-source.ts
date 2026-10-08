import "server-only"

import { headers } from "next/headers"

import { readVisitorSourceIp } from "./estl-visitor-source-core"

/** Server-only binding: reads the current request's trusted visitor address. */
export async function currentVisitorSourceIp(): Promise<string | null> {
  return readVisitorSourceIp(await headers(), process.env.VERCEL_ENV)
}
