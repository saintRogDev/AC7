import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "vitest"

import { readVisitorSourceIp } from "./estl-visitor-source-core.ts"

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8")
const headers = (record: Record<string, string>) => new Headers(record)

test("outside Vercel deployments every request is attributed to loopback, whatever the headers claim", () => {
  for (const environment of [undefined, "", "development", "test", "Production", "PREVIEW"]) {
    assert.equal(readVisitorSourceIp(headers({ "x-forwarded-for": "203.0.113.7" }), environment), "127.0.0.1", `env ${environment}`)
    assert.equal(readVisitorSourceIp(headers({}), environment), "127.0.0.1", `env ${environment} without headers`)
  }
})

test("on Vercel the platform-written forwarded address is used, taking the right-most entry", () => {
  for (const environment of ["production", "preview"]) {
    assert.equal(readVisitorSourceIp(headers({ "x-forwarded-for": "203.0.113.7" }), environment), "203.0.113.7")
    assert.equal(readVisitorSourceIp(headers({ "x-forwarded-for": " 203.0.113.7 " }), environment), "203.0.113.7")
    // If anything were ever appended, the last hop's entry is the trusted one.
    assert.equal(readVisitorSourceIp(headers({ "x-forwarded-for": "198.51.100.1, 203.0.113.7" }), environment), "203.0.113.7")
    assert.equal(readVisitorSourceIp(headers({ "x-forwarded-for": "2001:db8:85a3::8a2e:370:7334" }), environment), "2001:db8:85a3::8a2e:370:7334")
  }
})

test("on Vercel a missing or malformed forwarded address is unattributed, never a fabricated one", () => {
  for (const value of ["", "unknown", "203.0.113", "203.0.113.7:8080", "for=203.0.113.7", "203.0.113.7,", "<script>"]) {
    assert.equal(readVisitorSourceIp(headers({ "x-forwarded-for": value }), "production"), null, JSON.stringify(value))
  }
  assert.equal(readVisitorSourceIp(headers({}), "production"), null)
  // Other client-controllable headers never substitute for the platform's.
  assert.equal(readVisitorSourceIp(headers({ "x-real-ip": "203.0.113.7", forwarded: "for=203.0.113.7", "x-client-ip": "203.0.113.7" }), "production"), null)
})

test("attribution is read in one server-only module and the core never reads ambient configuration", () => {
  assert.match(read("lib/estl-visitor-source.ts"), /^import "server-only"/)
  assert.match(read("lib/estl-visitor-source.ts"), /process\.env\.VERCEL_ENV/)
  assert.doesNotMatch(read("lib/estl-visitor-source-core.ts"), /process\.env/)
  // The public action attributes through that module only; it never reads forwarding headers itself.
  const action = read("app/events/actions.ts")
  assert.match(action, /currentVisitorSourceIp/)
  assert.doesNotMatch(action, /x-forwarded-for|x-real-ip/)
  // Browser-reachable modules never touch attribution.
  for (const path of ["lib/events-core/adapter.ts", "lib/events-core/types.ts", "lib/events-core/server-adapter.ts", "components/events-core/public/event-detail.tsx"]) {
    assert.doesNotMatch(read(path), /estl-visitor-source|x-east-saint-source-ip/, path)
  }
})
