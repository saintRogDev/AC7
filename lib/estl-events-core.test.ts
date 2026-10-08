import { describe, expect, it, vi } from "vitest"
import { estlEventsRequest } from "./estl-events-core"
import { validateEventsResponse } from "./events-core/response-schema"
const env = { EAST_SAINT_PLATFORM_API_URL: "https://api.example.com", EAST_SAINT_SITE_KEY: `esk_prev_${"a".repeat(11)}_${"b".repeat(43)}`, VERCEL_ENV: "preview" }
const id = "734ff330-39c2-48ca-9096-781b173644de"
const context = { organization: { id, slug: "ac7-sandbox" }, client: { environment: "preview" } }
const response = (data: unknown, status = 200) => new Response(JSON.stringify({ data }), { status })
describe("AC7 Events transport", () => {
 it.each([
  { ...context, organization: { id, slug: "ac7" } },
  { ...context, client: { environment: "production" } },
  null,
 ])("refuses wrong or malformed site context before an Events request", async data => {
  const fetcher = vi.fn().mockResolvedValue(response(data))
  const result = await estlEventsRequest({ path: "/v1/events", environment: env, fetchImplementation: fetcher })
  expect(result).toMatchObject({ error: { code: "FORBIDDEN" } })
  expect(fetcher).toHaveBeenCalledTimes(1)
 })
 it("keeps credentials server-side, forbids redirects and caching, and forwards attributed source", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response(context)).mockResolvedValueOnce(response({ status: "verification_required" }))
  const result = await estlEventsRequest({ path: `/v1/events/${id}/registrations`, method: "POST", body: { name: "Test" }, sourceIp: "192.0.2.2", environment: env, fetchImplementation: fetcher })
  expect(result).toEqual({ data: { status: "verification_required" } })
  expect(fetcher.mock.calls[1][1]).toMatchObject({ cache: "no-store", redirect: "error", headers: { "x-east-saint-source-ip": "192.0.2.2", "x-east-saint-site-key": env.EAST_SAINT_SITE_KEY } })
 })
 it("rejects malformed list successes", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response(context)).mockResolvedValueOnce(response({ events: [{}], next_cursor: null }))
  expect(await estlEventsRequest({ path: "/v1/events", environment: env, fetchImplementation: fetcher })).toMatchObject({ error: { code: "UNAVAILABLE" } })
 })
 it.each(["https://evil.example/v1/events", "//evil.example/v1/events", "/v1/events/../../secrets"])("refuses unsafe path %s", async path => {
  const fetcher = vi.fn()
  expect(await estlEventsRequest({ path, environment: env, fetchImplementation: fetcher })).toMatchObject({ error: { code: "BAD_REQUEST" } })
  expect(fetcher).not.toHaveBeenCalled()
 })
 it("preserves rate limit guidance", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(response(context)).mockResolvedValueOnce(new Response("{}", { status: 429, headers: { "retry-after": "3600" } }))
  expect(await estlEventsRequest({ path: "/v1/events", environment: env, fetchImplementation: fetcher })).toMatchObject({ error: { code: "RATE_LIMITED", retryAfterSeconds: 3600 } })
 })
 it("requires replay to withhold the ticket and check-in to carry authoritative repeat state", () => {
  const path = `/v1/events/${id}/registrations/confirm`
  expect(validateEventsResponse(path, "POST", { id, replayed: true, token: "x".repeat(43) })).toBe(false)
  expect(validateEventsResponse(path, "POST", { id, replayed: true, token: null })).toBe(true)
  expect(validateEventsResponse(`/v1/admin/events/${id}/check-in`, "POST", { id, checked_in_at: null })).toBe(false)
 })
})
