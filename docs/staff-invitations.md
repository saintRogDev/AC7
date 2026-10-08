# AC7 staff invitations

`/admin/staff` allows verified AC7 administrators to review and send new-staff invitations through ESTL. Managers and reviewers cannot issue invitations. Existing-account grants and password recovery are outside this feature.

Shared behavior comes from the pinned `@east-saint/staff-invitations-client` artifact under `vendor/`; AC7 owns the local staff guard, environment mapping, server configuration and UI. The wrapper pins the approved ESTL API origin, `EAST_SAINT_SITE_KEY`, and production `ac7` versus sandbox `ac7-sandbox`. The shared transport verifies tenant/environment and administrator authority before the invitation POST. Never add a Supabase service-role key to AC7 for invitation issuance.

`/auth/confirm` GET presents a confirmation page without consuming the token. Explicit same-origin POST calls Supabase `verifyOtp(type: invite)`. Transient verification failure preserves retry; invalid/expired/replayed tokens return to login. `/accept-invite` verifies the user, matching session actor and signed claims before displaying password setup for an OTP-authenticated session. Password completion does not create or upgrade membership; protected admin routes still enforce the tenant's existing role.

Required provider acceptance is separate from implementation: configure the exact approved AC7 origin in ESTL's invitation client mapping and Supabase redirect settings/template; use the approved sandbox recipient; verify invitation delivery, explicit confirmation, password setup, tenant-role access and replay/error behavior. No invitation is sent by build/tests, and no provider configuration is changed by this PR. Production activation and existing-account onboarding require their own acceptance.
