"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import type { EventOffering, PaidEventPurchase, PaidEventTicket, PaidEventsPublicAdapter } from "@east-saint/events-client/paid"
import type { EstlResult, EventCore } from "@/lib/events-core/types"
import { recallPurchase, rememberPurchase, type PurchaseAccess } from "@/lib/events-core/paid-session"

type PaidOffering = Extract<EventOffering, { registration_mode: "paid" }>
const field = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-3 text-foreground"
const button = "rounded-full border border-border px-5 py-3 text-sm font-semibold disabled:opacity-50"
const money = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100)
const statusCopy: Record<PaidEventPurchase["status"], string> = {
  reserved: "Your tickets are held while you continue to payment.",
  checkout_pending: "We’re checking your checkout. Retry the same checkout or check again shortly.",
  checkout_ready: "Your checkout is ready. Payment has not been confirmed yet.",
  processing: "Your payment is processing. Tickets become available after payment is confirmed.",
  cancellation_pending: "Cancellation is being checked with the payment provider. Your purchase is not yet cancelled.",
  confirmed: "Payment confirmed. Each guest has a separate ticket below.",
  expired: "This purchase expired without confirmed admission.",
  failed: "Payment was not completed.",
  cancelled: "This purchase was cancelled. It has no valid tickets.",
  refunded: "This purchase was refunded. Its tickets are no longer valid.",
  refund_pending: "A refund is pending. These tickets cannot be used for admission.",
  requires_attention: "This purchase needs attention. Contact the organizer with your purchase reference. This is not a refund confirmation.",
}
function unwrap<T>(result: EstlResult<T>): T {
  if ("error" in result) throw new Error(result.error.message)
  return result.data
}
const textField = (fields: FormData, name: string) => String(fields.get(name) ?? "").trim()

/** Only an authoritative free offering can select the original RSVP flow. */
export function PaidRegistration({ event, adapter, freeRegistration, eventHref }: { event: EventCore; adapter: PaidEventsPublicAdapter; freeRegistration: ReactNode; eventHref: string }) {
  const [offering, setOffering] = useState<EventOffering | null>(null)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer) }, [])
  useEffect(() => {
    let active = true
    adapter.getOffering({ eventId: event.id, body: {} }).then(result => {
      if (!active) return
      if ("error" in result) { setError(result.error.message); return }
      setOffering(result.data); setError("")
    }).catch(() => { if (active) setError("Ticket information could not be loaded.") })
    return () => { active = false }
  }, [adapter, event.id, reload])
  if (offering?.registration_mode === "free") return freeRegistration
  if (!offering && !error) return <p role="status">Loading registration options…</p>
  return <>
    {error ? <div role="alert" className="rounded-xl border border-border p-4"><p>{error}</p><button type="button" className={button} onClick={() => setReload(value => value + 1)}>Retry ticket information</button></div> : null}
    <PaidTickets eventId={event.id} adapter={adapter} offering={offering?.registration_mode === "paid" ? offering : null} salesAvailable={event.status === "published" && Date.parse(event.ends_at) > now} eventHref={eventHref} />
  </>
}

export function PaidTickets({ eventId, purchaseId, adapter, offering = null, salesAvailable = false, eventHref }: {
  eventId: string; purchaseId?: string; adapter: PaidEventsPublicAdapter; offering?: PaidOffering | null; salesAvailable?: boolean; eventHref: string
}) {
  const [access, setAccess] = useState<PurchaseAccess | null>(null)
  const [purchase, setPurchase] = useState<PaidEventPurchase | null>(null)
  const [tickets, setTickets] = useState<PaidEventTicket[]>([])
  const [restoring, setRestoring] = useState(Boolean(purchaseId))
  const [recovering, setRecovering] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const lock = useRef(false)
  const mounted = useRef(true)
  const accessRef = useRef<PurchaseAccess | null>(null)
  const commands = useRef<Record<string, { payload: string; key: string }>>({})
  const reservationIntent = useRef<{ quantity: number; offering_version: string } | null>(null)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    if (!purchaseId) return
    const saved = recallPurchase(eventId, purchaseId)
    accessRef.current = saved
    // Restore tab credentials; payment status always comes from a new server read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccess(saved); setRestoring(false); setRecovering(!saved)
  }, [eventId, purchaseId])

  const saveAccess = useCallback((value: PurchaseAccess) => {
    accessRef.current = value
    rememberPurchase(eventId, value)
    if (mounted.current) setAccess(value)
  }, [eventId])
  const refresh = useCallback(async (value: PurchaseAccess) => {
    try {
    const current = unwrap(await adapter.getPurchase({ eventId, purchaseId: value.purchaseId, body: { access_token: value.token } }))
    if (!mounted.current || accessRef.current?.token !== value.token) return
    setPurchase(current)
    if (current.status !== "confirmed") setTickets([])
    if (current.status === "confirmed") {
      const result = unwrap(await adapter.getTicket({ eventId, purchaseId: current.id, body: { access_token: value.token } }))
      if (result.tickets.length !== current.price.quantity || result.tickets.some(ticket => !current.registration_ids.includes(ticket.registration_id))) throw new Error("The ticket collection could not be verified. Please refresh.")
      if (mounted.current && accessRef.current?.token === value.token) setTickets(result.tickets)
    }
    } catch (cause) {
      if (mounted.current && accessRef.current?.token === value.token) { setTickets([]); setPurchase(null) }
      throw cause
    }
  }, [adapter, eventId])

  const accessPurchaseId = access?.purchaseId
  const accessToken = access?.token
  useEffect(() => {
    if (!accessPurchaseId || !accessToken) return
    let stopped = false
    const poll = async () => {
      const value = accessRef.current
      if (stopped || !value || lock.current || document.hidden) return
      lock.current = true
      try { await refresh(value); if (!stopped) setError("") }
      catch { if (!stopped) { setTickets([]); setError("We couldn’t verify the latest purchase status. Please retry.") } }
      finally { lock.current = false }
    }
    void poll()
    const timer = setInterval(() => { void poll() }, 10_000)
    return () => { stopped = true; clearInterval(timer) }
  }, [accessPurchaseId, accessToken, refresh])

  function key(name: string, payload: unknown) {
    const encoded = JSON.stringify(payload)
    if (commands.current[name]?.payload !== encoded) commands.current[name] = { payload: encoded, key: crypto.randomUUID() }
    return commands.current[name].key
  }
  async function run(task: () => Promise<void>) {
    if (lock.current) return
    lock.current = true; setBusy(true); setError(""); setNotice("")
    try { await task() }
    catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : "The request could not be completed. Retry the same request.") }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }
  function verify(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (!offering) return
    const fields = new FormData(ev.currentTarget)
    const body = { name: textField(fields, "name"), email: textField(fields, "email"), website: textField(fields, "website") }
    void run(async () => {
      unwrap(await adapter.requestVerification({ eventId, body: { ...body, idempotency_key: key("verify", body) } }))
      reservationIntent.current = { quantity, offering_version: offering.offering_version }
      setVerificationSent(true); setNotice("Check your email for a verification code. Tickets are reserved after verification succeeds.")
    })
  }
  function reserve(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (!reservationIntent.current) return
    const body = { ...reservationIntent.current, verification_token: textField(new FormData(ev.currentTarget), "code") }
    void run(async () => {
      const result = unwrap(await adapter.createPurchase({ eventId, body: { ...body, idempotency_key: key("reserve", body) } }))
      saveAccess({ purchaseId: result.purchase.id, token: result.access_token, checkoutKey: crypto.randomUUID() })
      setPurchase(result.purchase)
    })
  }
  function checkout() {
    void run(async () => {
      if (!access) return
      if (purchase?.status === "checkout_ready") { window.location.assign(purchase.checkout.url); return }
      if (purchase?.status === "checkout_pending" && !access.checkoutKey) return
      const next = { ...access, checkoutKey: access.checkoutKey ?? crypto.randomUUID() }
      saveAccess(next)
      const current = unwrap(await adapter.startCheckout({ eventId, purchaseId: next.purchaseId, body: { access_token: next.token, idempotency_key: next.checkoutKey } }))
      setPurchase(current); setTickets([])
      if (current.status === "checkout_ready") window.location.assign(current.checkout.url)
      else if (current.status === "confirmed") await refresh(next)
    })
  }
  function requestRecovery(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fields = new FormData(ev.currentTarget), reference = textField(fields, "reference")
    const body = { email: textField(fields, "email"), website: textField(fields, "website"), ...(reference ? { purchase_id: reference } : {}) }
    void run(async () => {
      unwrap(await adapter.requestRecovery({ eventId, body: { ...body, idempotency_key: key("recovery", body) } }))
      setRecoverySent(true); setNotice("If a matching purchase exists, we’ll email a recovery code. Check the email used for your purchase.")
    })
  }
  function confirmRecovery(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const body = { recovery_token: textField(new FormData(ev.currentTarget), "code") }
    void run(async () => {
      const result = unwrap(await adapter.recoverPurchase({ eventId, body: { ...body, idempotency_key: key("recover-confirm", body) } }))
      const next = { purchaseId: result.purchase.id, token: result.access_token }
      saveAccess(next); setPurchase(result.purchase); setRecovering(false); setTickets([])
      await refresh(next)
    })
  }
  const available = offering && offering.sales_status === "on_sale" && salesAvailable
  return <section className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:p-7" aria-busy={busy}>
    {error ? <p role="alert" className="rounded-lg border border-red-300 p-3 text-sm text-red-700">{error}</p> : null}
    {notice ? <p role="status" className="text-sm leading-6">{notice}</p> : null}
    {restoring ? <p role="status">Opening your purchase…</p> : recovering ? <>
      <h2 className="text-2xl font-semibold">Recover your purchase</h2><p className="text-sm">Use the email you entered when buying tickets.</p>
      {!recoverySent ? <form key="recover-request" onSubmit={requestRecovery} className="grid gap-4">
        <label>Email<input className={field} name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>Purchase reference (optional)<input className={field} name="reference" defaultValue={purchaseId ?? ""} maxLength={36} /></label><Honeypot />
        <button className={button} disabled={busy}>Email recovery code</button>
      </form> : <form key="recover-confirm" onSubmit={confirmRecovery} className="grid gap-4">
        <CodeInput label="Recovery code" /><button className={button} disabled={busy}>Recover purchase</button>
        <button type="button" className={button} disabled={busy} onClick={() => { delete commands.current.recovery; setRecoverySent(false) }}>Request another code</button>
      </form>}
    </> : access ? <>
      <h2 className="text-2xl font-semibold">{purchase?.status === "confirmed" ? "Your tickets" : "Your purchase"}</h2>
      {purchase ? <><p role="status" className="text-sm leading-6">{statusCopy[purchase.status]}</p><p>{purchase.price.quantity} × {money(purchase.price.unit_amount_minor)}{purchase.settlement ? ` · Total ${money(purchase.settlement.total_minor)}` : ""}</p></> : <p role="status">Checking the latest payment status…</p>}
      <p className="break-all text-xs text-muted-foreground">Purchase reference: {access.purchaseId}</p>
      {purchase && (["reserved", "checkout_ready"].includes(purchase.status) || (purchase.status === "checkout_pending" && access.checkoutKey)) ? <button className={`${button} bg-primary text-primary-foreground`} disabled={busy} onClick={checkout}>{purchase.status === "checkout_pending" ? "Retry the same checkout" : "Continue to secure payment"}</button> : null}
      <div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => void run(() => refresh(access))}>Refresh status</button>
        {purchase && ["reserved", "checkout_ready", "checkout_pending", "processing"].includes(purchase.status) ? <button className={button} disabled={busy} onClick={() => {
          if (!window.confirm("Request cancellation of this unpaid purchase? Any payment already processing must be resolved first.")) return
          void run(async () => { const body = { access_token: access.token }; const result = unwrap(await adapter.cancelPurchase({ eventId, purchaseId: access.purchaseId, body: { ...body, idempotency_key: key("cancel", body) } })); setPurchase(result); setTickets([]) })
        }}>Cancel purchase</button> : null}</div>
      {tickets.length ? <><p className="text-sm">Keep each code private. Each admits one guest.</p><div className="grid gap-4 sm:grid-cols-2">{tickets.map((ticket, index) => <AdmissionCode key={ticket.registration_id} ticket={ticket} number={index + 1} count={tickets.length} />)}</div><button className={button} onClick={() => window.print()}>Print tickets</button></> : null}
      {purchase && ["expired", "failed", "cancelled"].includes(purchase.status) ? <a className="text-sm underline" href={eventHref}>Return to event</a> : null}
    </> : verificationSent ? <>
      <h2 className="text-2xl font-semibold">Verify your email</h2><p className="text-sm">Paste the code from your email to reserve your selected tickets.</p>
      <form key="verification" className="grid gap-4" onSubmit={reserve}><CodeInput label="Verification code" /><button className={button} disabled={busy}>Reserve tickets</button></form>
      <button className={button} disabled={busy} onClick={() => { delete commands.current.verify; setVerificationSent(false) }}>Change details or request another code</button>
    </> : available ? <>
      <h2 className="text-2xl font-semibold">Get your tickets</h2><p>{money(offering.price.unit_amount_minor)} each · {offering.price.tax_behavior === "inclusive" ? "Tax included" : "Applicable tax calculated at checkout"}</p>
      <form key="buyer" onSubmit={verify} className="grid gap-4">
        <label>Number of tickets<select className={field} value={quantity} onChange={ev => setQuantity(Number(ev.target.value))} disabled={busy}>{Array.from({ length: offering.max_per_purchase }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
        <p className="text-lg font-semibold">{money(offering.price.unit_amount_minor * quantity)} {offering.price.tax_behavior === "inclusive" ? "including tax" : "before applicable tax"}</p>
        <label>Your name<input className={field} name="name" autoComplete="name" maxLength={200} required /></label>
        <label>Email for your tickets<input className={field} name="email" type="email" autoComplete="email" maxLength={254} required /></label><Honeypot />
        <button className={`${button} bg-primary text-primary-foreground`} disabled={busy}>Verify email to continue</button>
        <p className="text-sm text-muted-foreground">We’ll send a code first. You won’t be charged until you complete secure checkout.</p>
      </form>
    </> : <><h2 className="text-2xl font-semibold">Ticket sales unavailable</h2><p className="text-sm">Sales may be paused or this event may have ended. Existing buyers can still recover their purchase.</p></>}
    {!recovering && !restoring ? <button type="button" className="text-left text-sm underline" disabled={busy} onClick={() => { setRecovering(true); setError(""); setNotice("") }}>Already purchased? Recover your tickets</button> : null}
  </section>
}

function CodeInput({ label }: { label: string }) { return <label>{label}<input className={field} name="code" autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} pattern="[A-Za-z0-9_-]{43}" required /></label> }
function Honeypot() { return <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label> }
function AdmissionCode({ ticket, number, count }: { ticket: PaidEventTicket; number: number; count: number }) {
  const [image, setImage] = useState("")
  useEffect(() => {
    let active = true
    import("qrcode").then(qr => qr.toDataURL(ticket.token, { width: 280, margin: 3, errorCorrectionLevel: "M" })).then(value => { if (active) setImage(value) }).catch(() => {})
    return () => { active = false }
  }, [ticket.token])
  // eslint-disable-next-line @next/next/no-img-element -- Locally generated opaque QR data; no remote image optimization.
  return <article className="grid justify-items-center gap-3 break-inside-avoid rounded-xl border border-dashed border-border bg-white p-4 text-black"><h3 className="font-semibold">Ticket {number} of {count}</h3>{image ? /* Opaque QR data is generated locally; no remote image optimization. */ <img src={image} width={280} height={280} alt={`Admission QR code for ticket ${number}`} className="max-w-full" /> : <p className="text-sm">Use the admission code below.</p>}<details className="w-full text-center"><summary className="cursor-pointer text-sm">Show admission code</summary><code className="block break-all py-3 text-xs">{ticket.token}</code></details><p className="text-xs">One guest · Present this ticket at the door.</p></article>
}
