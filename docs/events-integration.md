# AC7 Events integration

Public free Events uses `/events` and `/events/[eventId]`. Public pages and all public actions default closed until `ESTL_EVENTS_PUBLIC_ENABLED=true`. Authorized staff use `/login` and `/admin/events` to create draft/published/cancelled Events, review attendees, register guests, and validate/check in tickets. Paid Events are not enabled.

The existing AC7 public navigation, donation flow and branding remain. The staff sidebar adapts the existing `v0/ac7-foundation-admin-334f79b2` presentation with real session/environment details; unimplemented mock modules are not imported. Generic Events components and contracts reuse MDI PR #27 with the guest idempotency and capacity fixes. Auth follows the reviewed Dancing Doula SSR implementation.

## Environment

Canonical Vercel project: `v0-ashton-carter-website` (`prj_igS1niqLKB38GxTWLAMe7T5ZHqsx`), serving `ac7foundation.com`.

- `EAST_SAINT_PLATFORM_API_URL`: ESTL HTTPS origin.
- `EAST_SAINT_SITE_KEY`: server-only scoped site credential.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: shared staff Auth public configuration.
- `ESTL_EVENTS_PUBLIC_ENABLED`: explicit public rollout gate.

Production is pinned to `ac7`; Preview/development to `ac7-sandbox`. Every transport verifies `/v1/site-context` organization and environment before Events requests. Every staff action verifies authenticated identity, local organization membership and ESTL `/v1/admin/session` agreement. Reviewers cannot access Events. Credentials never reach browser bundles; requests disable caching and redirects.

## Acceptance and release

Sandbox configuration checkpoint: `ac7` and `ac7-sandbox` organizations exist,
and the approved existing operator has sandbox admin membership. The Preview
branch now has public Supabase configuration, the ESTL origin, a separately
scoped server-only site credential, and the public Events flag. Credential
registration was verified by safe-prefix readback; its temporary operator route
was disabled and verified closed afterwards. No production credential or Events
activation is included. Rebuild and authenticated live acceptance remain required.

Live acceptance on Preview `7c6e2d7` (`dpl_GJHAHwzjXnccJABYdQJ4Lf2MukCn`):
the approved operator signed in as `ac7-sandbox` admin and created synthetic
event `aeda8f1f-9cf3-408e-bdf9-ec916cdeded3`. Public signup sent a provider-accepted
email, consumed at `2026-10-08T04:46:56.004844Z`, and created registration
`e6791c29-bfe3-4f13-a33a-cf121dc214a9` with `staff_registered_at=null`.
The owner reported successful phone check-in; database readback confirmed
admission by the approved admin at `2026-10-08T05:02:17.167106Z` in `ac7-sandbox`.
Duplicate/foreign-ticket live cases and inbox-versus-Spam placement were not
reported for this AC7 run. Production `ac7` now has a separate active website credential. The production
site-context probe returned `ac7` / `production`, and the approved operator has
production admin membership. Deployment and production verification follow.

Local tests cover tenant mismatch, failed auth, privileged actions, malformed responses, public flag, visitor IP, rate limits, ticket check-in, camera fallback, retry idempotency, and positive integer capacity. Build enforces TypeScript rather than ignoring errors. Lint keeps four existing generated UI warnings scoped to existing files.

Before activation: provision AC7 production/sandbox organizations and scoped credentials, configure environment, verify authenticated site context, approve staff membership, run sandbox registration → mailbox code → ticket → admission plus duplicate/foreign-ticket rejection, then review exact commit and production configuration. Public listing alone is not complete proof. Rollback disables `ESTL_EVENTS_PUBLIC_ENABLED` and restores the previous deployment.
