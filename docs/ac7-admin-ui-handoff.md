# AC7 admin — phase 1 cleanup, full handoff pending

## Base and scope

Verified clean starting tree on `v0/ac7-foundation-admin-334f79b2`, HEAD `0af8240`. The existing admin prototype was present; no replacement portal was created. This phase preserves its design and fixture schemas.

Nine deliverable files: eight implementation files below and this document. The planning artifact is maintained separately from the repository diff.

| File | Phase 1 change |
| --- | --- |
| `components/admin/admin-shell.tsx` | Persistent Preview/sample-data label, accessible full description, constrained header title |
| `app/admin/(shell)/page.tsx` | New photo submission count derived from existing fixtures, singular/plural wording |
| `app/admin/(shell)/gallery/page.tsx` | Add/update/remove feedback explicitly local and non-persistent |
| `app/admin/(shell)/staff/page.tsx` | Invite/resend/role/revoke/restore feedback explicitly synthetic; no email or account changes |
| `components/admin/invite-staff-dialog.tsx` | Explain sample entry creation and absence of email/account side effects |
| `app/admin/(shell)/submissions/[id]/page.tsx` | Review/archive/restore/note feedback explicitly not saved to a backend |
| `app/admin/login/page.tsx` | Labeled password visibility control and warning against real credentials |
| `app/admin/invite/page.tsx` | Two labeled visibility controls, minimum-length helper, associated invalid/error feedback, synthetic acceptance wording |

No public/shared components, fixture modules, route handlers, guards, server layouts, global styles, root layout, config, dependency manifests, or lockfiles changed. No deployment, real authentication, credential provisioning, token creation, invitation delivery, or backend integration was added. Store work remains unexecuted.

## Synthetic behavior boundary

All existing demo mutation handlers remain local React state or local timers. They do not provide persistence, authorization, session protection, credential verification, delivery, or public publication. Password visibility only changes an input type; minimum length is demo UX, not a security implementation. Use fake values only. Existing auth routes remain an unprotected prototype and are not production-ready.

The staff dialog's existing `onInvite({ name, email, role })` callback updates local sample rows; `open` and `onOpenChange` control the dialog. The login/invite pages still own their timer-based handlers; they have not been refactored into injectable auth interfaces. Toast labels and the persistent preview label explain these limits. Other unchanged prototype controls and copy still require the later full presentation review.

## Phase 1 verification

- `pnpm build`: passed. Existing configuration explicitly skips TypeScript validation, so this is not a type-safety pass.
- `git diff --check`: passed for implementation changes.
- Browser, development preview with dark media preference: dashboard screenshots at 320x687, 768x900, 1280x900 confirmed visible preview labels and preserved layout. At 320px document scroll width equals viewport width. The application retains its existing light visual treatment despite the browser media preference.
- At 631x687: invite submission with insufficient length announces a visible error; both visibility controls changed their associated input to text. Login visibility roundtrip returned text to password. Labels and error associations inspected.
- Staff dialog preview disclaimer and sample invite outcome exercised with fake values: toast states `Invitation drafted (no email sent)` and no account creation. This is a local simulation, not a delivery test.
- Public route smoke checks: `/`, `/contact`, `/donate`, `/foundation`, `/gallery`, `/his-story` opened and returned expected site/page headings or titles. No public forms or payments submitted.
- Still unverified in this pass: exhaustive keyboard/screen-reader review, every filter/sort/reset/editor/menu path, all gallery/submission toast paths, every dialog/table at each viewport, and full auth success/mismatch/redirect regression coverage. Do not describe these as passed.

### Baseline failures, separate from phase 1 results

`pnpm exec tsc --noEmit --incremental false` was run before and after edits. Both runs reported the same four errors, with no new diagnostics:

- `app/actions/stripe.ts:28,61`: missing `Stripe` namespace (TS2503).
- `components/donation-checkout.tsx:24,48`: nullable session secret callback incompatible with `Promise<string>` (TS2322).

`pnpm lint` failed before edits because `eslint` is not installed. Package scripts and dependencies remain unchanged; no installation or disabling of checks was attempted because tooling changes are outside scope. Lint remains incomplete. These baseline failures were not fixed or concealed.

## Remaining work against the updated AC7 v0 prompt

The full handoff is **not complete**. Phase 1 does not satisfy the following requirements:

- [ ] Events presentation: public list/detail, RSVP verification and ticket, staff list/editor/attendees/registration, and check-in states. All remain pending; no Events routes or APIs were created.
- [ ] Auth presentation: injectable callbacks and explicit pending, success, denied, expired, unavailable, and uncertain-delivery states. Existing demo timers and phase 1 password controls do not satisfy this contract.
- [ ] Full integration maps for Claude: enumerate views, props, callbacks, intended routes, scenarios, and backend responsibilities. Separate actually implemented interfaces from proposed ones and identify unresolved contracts rather than fabricating them.
- [ ] Complete the remaining interaction/accessibility/responsive verification listed above and resolve baseline tooling/type failures in their own authorized scope.

### Future integration map checklist for Claude (not implemented)

For each Events/auth view, record its proposed route, input props, callback signatures, pending/error/success scenarios, and mock adapter boundary. Backend ownership must explicitly cover authorization and access checks, credential/session handling, token issuance/expiry/verification, invitation and RSVP email delivery/retry uncertainty, event and attendee persistence, registration rules, ticket validity, and check-in idempotency. No such backend responsibility is implemented or guaranteed by this UI cleanup.

Keep future synthetic scenarios clearly labeled and isolated. Any real backend or production work requires a separate authorized phase. Merchant/Store surfaces remain outside this pass.
