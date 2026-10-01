# AC7 auth presentation — Claude integration map

## Implemented, isolated interfaces

Review route: `/admin/auth-preview` at https://ac7-foundation-admin.v0.build/admin/auth-preview (existing protection remains). Development/Vercel Preview only; not a production entry point. The phase 1 `/admin/login`, `/admin/invite`, staff page and staff dialog are **unchanged**. Their existing synthetic handlers were not replaced. This review adds reusable presentation, not an alternate authentication service.

`components/admin/auth/auth-form.tsx` exports:

- `AuthForm({ mode: AuthMode, onSubmit?: AuthCallback })`.
- `AuthMode`: `Sign in | Accept invitation | Invite staff | Reset password`.
- `AuthValues`: `{ email: string; password?: string; name?: string }`.
- `AuthCallback`: `(values: AuthValues) => Promise<AuthResult>`.
- `AuthResult`: `success | error | denied | expired | unavailable | uncertain-delivery`.
- `authOutcomes` adds `pending` for the scenario workbench. Pending is not a terminal callback result.

These are view-level shapes, **not proposed service schemas**. No tokens, cookies, sessions, credential provisioning, transport, tenant IDs, or role assignment are handled. The injected synthetic callback ignores form values and returns only the selected scenario. No secrets are logged or persisted. Invented password input remains transient in the DOM/handler closure, is cleared after callback settlement, and must never be a real password. The form makes no password-strength or authentication guarantee. The acceptance length/matching check is presentation validation only.

## Views and integration placement

| View | Fields and presentation behavior | Intended placement (not integrated) | Backend responsibility |
| --- | --- | --- | --- |
| Sign in | Email, sample password, show/hide, native required/email checks | Presentation portion of existing `/admin/login` | Authentication, sessions, safe redirects and role-aware entry |
| Accept invitation | Email, new sample password, confirmation, associated inline mismatch/length errors, two visibility controls | Presentation portion of existing `/admin/invite` | Secure invited identity/context, expiry, replay prevention and acceptance |
| Invite staff | Name/email in a scrollable Radix dialog; no role selection/assignment | Existing staff dialog after approved adapter is ready | Operation permission, allowed roles, invitation creation, delivery and reconciliation |
| Reset password | Email and callback feedback | Existing recovery link after route/contract agreement | Non-enumerating response, verified secure recovery and delivery |

Do not simply wire a real service into the demo callback. Extract production wrappers with correct copy, labels, autocomplete, field/identity policies and response mapping. Preserve real guards/actions if the project advances. The current success text explicitly means *nothing happened* and must not be reused as a claim of live authentication.

## State behavior

`AuthForm` owns pending/result, an immediate ref lock against duplicate requests, validation copy and visibility toggles. An omitted callback disables submission and displays `Action disconnected`. Pending/success/uncertain-delivery disable submission. Errors are announced via alerts; pending/success via status regions. The function does not interpret or display raw thrown service errors.

`AuthPreview` owns selected mode/outcome, explicit synthetic reset, dialog open state and held-pending completion. There are no timers. Pending can be completed with success or error by the reviewer. Throws in invitation/recovery map conservatively to uncertain-delivery; sign-in/acceptance throws map to error. The uncertainty text currently names invitations; connected wrappers should provide operation-specific copy for recovery.

Invitation uncertainty persists across dialog close/reopen in the workbench. Closing a held invitation resolves the demo as uncertain; it does not cancel a hypothetical backend operation or prove failure. No resend control appears. Only **Reset synthetic form** clears the review scenario. A live implementation needs reconciliation, not reset-to-retry. Radix handles focus containment and trigger return; the dialog scrolls within 90svh.

## Contracts and responsibilities still pending

Claude/Codex own all authentication/session security, authorized role choices, tenant/role checks and per-operation policy, privacy-safe outcome mapping, invitation/recovery issuance and delivery, retries/idempotency, safe redirects, session-expiry recovery, audit and user-data storage. Neither planned `/v1/staff/session` nor merchant-only `/v1/admin/session` is called here. Neither portal entry nor client visibility grants operation access.

No auth service/provider, fake persisted session, invite token, browser-direct ESTL/Supabase call or network side effect was added. Pending/error/success previews are not backend tests. Leave the existing public site and Store work intact. See `ac7-phase2-validation.md` for verified checks and explicit unverified mobile/keyboard/delivery interaction gates.
