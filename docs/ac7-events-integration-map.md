# AC7 Events — Claude integration map

## Delivery and safety boundary

Phase 2 starts at `fc513cb524f61280afd5203d7b14f7758d350c8b` on `v0/ac7-foundation-admin-334f79b2`. Phase 1 is unchanged. Review route: `/admin/events`; hosted preview: https://ac7-foundation-admin.v0.build/admin/events (requires existing preview access). This is one isolated scenario workbench, not ten activated production routes. It is available in development or a Vercel Preview build; otherwise its server page calls `notFound()`. Do not promote a preview artifact containing demonstrations to production. This environment gate is isolation, not authentication or authorization.

Everything is synthetic and in-memory. No provider, API, fetch, server action, migration, persistent storage, ticket/token generation, QR/barcode, email, camera stream, or real check-in is implemented. Fixture labels such as `DEMO-ALEX` are illustrative exact-match strings, never admission credentials. Existing public pages, navigation, root/global styles, server layouts/guards, fixture schemas, dependencies, lockfiles and Store work are unchanged.

## Implemented view map

All views below are selectable in `/admin/events`. Production routes are **proposals only**, not API or routing contracts.

| View | Implemented component / input | Implemented local callback | Proposed destination |
| --- | --- | --- | --- |
| Public list / detail | `VisitorEvents({ view, outcome, onNavigate, onRegister, onVerify })`; fixed illustrative event | `onNavigate(VisitorView)` | `/events`, `/events/[slug]` |
| RSVP | `RegistrationForm({ onRegister, staff? })` | `onRegister({ name, email }): Promise<RegistrationResult>` | `/events/[slug]/rsvp` |
| Verification | `VisitorEvents`, verification result and duplicate-request lock | `onVerify(): Promise<RegistrationResult>`; no credential/token input | `/events/verify` |
| Ticket | `VisitorEvents`, name/date/location and not-valid-for-admission notice | None: read-only illustration, no download or credential issuance | `/events/ticket` |
| Staff list | `StaffEvents({ view, onNavigate, checkedIn })` | `onNavigate(StaffView)` | `/admin/events` |
| Editor | `StaffEvents`, title/description component state | Form submit previews local draft; **no save/publish callback** | `/admin/events/[id]/edit` |
| Attendees | `StaffEvents`, `checkedIn: ReadonlySet<string>` | Local search, attendance filter, reset | `/admin/events/[id]/attendees` |
| Registration | `RegistrationForm`, `staff=true` | Same view callback as RSVP, not permission to bypass verification | `/admin/events/[id]/register` |
| Check-in | `CheckInView({ onCheckIn? })` | `onCheckIn({ reference, validateOnly }): Promise<CheckInResult>` | `/admin/events/[id]/check-in` |

These are TypeScript **view props**, not wire payload definitions. Data reads in the visitor/staff presenters currently use `sample-events.ts` explicitly; they are not service-ready entity models. Claude must replace that dependency with approved data props in a separately authorized integration. No event repository or transport adapter is supplied. Missing registration/check-in callbacks disable their forms and explain why.

## Scenario catalog and state ownership

`EventsPreview` owns scenario choices, navigation, a local attendance set, and explicit pending-request completion. No arbitrary latency or background request is simulated. A held request disables scenario switching/reset until the reviewer completes it. Returning to a view starts a new form; the attendance set remains until reset or route exit. Editor changes are discarded when leaving the view.

- Every view: ready, loading, empty, error, unavailable, forbidden, expired-session. Loading is deliberately held visual presentation, not an actual data read.
- Registration/verification/ticket: verification-required, success, pending, duplicate, full, closed, cancelled, invalid, expired, revoked, error, unavailable, uncertain-delivery.
- Check-in: valid without admission, checked-in, duplicate, invalid, wrong-event, revoked, expired-ticket, pending, error, unavailable, forbidden, expired-session, uncertain.
- Attendees: search/filter/no-results/reset and locally reflected check-in status.
- Public detail disables RSVP for full/closed/cancelled scenarios. Draft publication is disabled with visible explanation.

`evaluateSampleCheckIn` is a pure fixture evaluator. The preview adapter updates its local set only on `checked-in`. It checks existing membership before adding; validate-only never mutates attendance, and validating an already-used reference returns duplicate. This is **not durable idempotency** and makes no cross-tab/concurrency guarantee.

The scan field supports manual entry and keyboard-wedge input followed by Enter. It suppresses Enter during IME composition and keyCode 229, ignores repeat submissions while pending, never follows links/evaluates payloads, and restores focus after completion. Camera permission/denied/device states are not implemented because there is no camera feature; use keyboard capture only. Test labels include wrong-event and revoked cases. Unknown check-in outcomes block resubmission in the current form; only the explicitly labeled synthetic reset/scenario controls restart a demo. Connected recovery must be server-owned.

## Claude / ESTL responsibilities — not implemented

- Agree final data models, route layout, endpoint contracts, timezone/capacity/registration policy, status lifecycle and public visibility. Editor schedule/capacity remain illustrative read-only copy, not operational controls.
- Supply real event/attendee props, loading/error boundaries and data pagination. Remove sample imports and the scenario workbench from integrated production surfaces.
- Enforce tenant and operation-specific authorization server-side. Portal entry is not check-in, event editing, publication or staff-invitation permission.
- Authoritatively validate registration, capacity and duplicate rules; email verification, expiry, replay resistance, ticket issuance/revocation and cancellation.
- Resolve unknown delivery/check-in outcomes before any retry. Use durable operation IDs/idempotency and atomic check-in uniqueness. Never use the UI Set as enforcement.
- Implement secure scan payload parsing and event binding in a server adapter. No token format is defined here.
- Decide authenticated attendee-data access, audit trail and data minimization. No real addresses belong in this workbench.
- Provide a secure verification context to `onVerify` via an approved wrapper, not a demo-generated token.

See `ac7-phase2-validation.md` for evidence and remaining review gates. No production readiness or successful ESTL integration is claimed.
