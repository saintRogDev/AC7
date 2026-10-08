/**
 * Pin the timezone for date assertions.
 *
 * The date-only regression this suite guards (a "2026-08-10" value rendering as
 * Aug 9) is only observable in a timezone behind UTC. CI here runs in UTC,
 * where the buggy and correct implementations produce identical output and the
 * test silently proves nothing. A fixed negative offset makes it real.
 */
process.env.TZ = "America/New_York"
