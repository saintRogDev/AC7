"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { eventOfferingSchema, paidEventSalesSchema, type EventOffering } from "@east-saint/events-client/paid"
import type { z } from "zod"
import type { EstlResult, EventCore } from "@/lib/events-core/types"

export type TicketManagementActions = {
  offering: (eventId: string) => Promise<EstlResult<unknown>>
  sales: (eventId: string, cursor?: string | null) => Promise<EstlResult<unknown>>
  configure: (input: unknown) => Promise<EstlResult<unknown>>
}
type Sales = z.infer<typeof paidEventSalesSchema>
const money = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100)
const field = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
const button = "rounded-full border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
function data(result: EstlResult<unknown>) {
  if ("error" in result) throw new Error(result.error.message)
  return result.data
}

export function TicketSalesPanel({ event, actions }: { event: EventCore; actions: TicketManagementActions }) {
  const [offering, setOffering] = useState<EventOffering | null>(null)
  const [sales, setSales] = useState<Sales | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const lock = useRef(false)
  const mounted = useRef(true)
  const intent = useRef<{ body: string; key: string } | null>(null)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const load = useCallback(async () => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError("")
    try {
      const [offeringResult, salesResult] = await Promise.all([actions.offering(event.id), actions.sales(event.id)])
      const nextOffering = eventOfferingSchema.parse(data(offeringResult))
      const nextSales = paidEventSalesSchema.parse(data(salesResult))
      if (nextOffering.event_id !== event.id || nextSales.purchases.some(p => p.event_id !== event.id)) throw new Error("The event response could not be verified.")
      if (mounted.current) { setOffering(nextOffering); setSales(nextSales); setRevision(value => value + 1) }
    } catch { if (mounted.current) setError("Ticket settings could not be loaded. Retry before making changes.") }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }, [actions, event.id])

  useEffect(() => {
    // Loading state tracks this external server request, matching the existing Events loaders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  async function save(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (lock.current || !offering) return
    const fields = new FormData(ev.currentTarget)
    const price = String(fields.get("price"))
    if (!/^\d+(?:\.\d{1,2})?$/.test(price)) { setError("Enter a ticket price with no more than two decimal places."); return }
    const body = {
      expected_version: offering.registration_mode === "paid" ? offering.offering_version : null,
      price: { currency: "USD", unit_amount_minor: Math.round(Number(price) * 100), tax_behavior: fields.get("tax") },
      max_per_purchase: Number(fields.get("quantity")), sales_status: fields.get("status"),
    }
    const encoded = JSON.stringify(body)
    if (intent.current?.body !== encoded) intent.current = { body: encoded, key: crypto.randomUUID() }
    lock.current = true; setBusy(true); setError(""); setNotice("")
    try {
      const value = data(await actions.configure({ eventId: event.id, body: { ...body, idempotency_key: intent.current.key } }))
      const saved = eventOfferingSchema.parse(value)
      if (saved.event_id !== event.id || saved.registration_mode !== "paid") throw new Error("The saved settings could not be verified.")
      if (mounted.current) { setOffering(saved); setNotice("Ticket settings saved. Publication and event capacity remain in Edit event.") }
    } catch (cause) { if (mounted.current) setError(cause instanceof Error && !("issues" in cause) ? cause.message : "Ticket settings could not be verified. Reload before retrying.") }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }

  async function more() {
    if (lock.current || !sales?.next_cursor) return
    lock.current = true; setBusy(true); setError("")
    try {
      const page = paidEventSalesSchema.parse(data(await actions.sales(event.id, sales.next_cursor)))
      if (page.purchases.some(p => p.event_id !== event.id)) throw new Error()
      if (mounted.current) setSales(current => current ? { ...page, purchases: [...current.purchases, ...page.purchases.filter(p => !current.purchases.some(old => old.id === p.id))] } : page)
    } catch { if (mounted.current) setError("More purchases could not be loaded. Please retry.") }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }

  const paid = offering?.registration_mode === "paid" ? offering : null
  const canConfigure = Boolean(paid) || event.status === "draft"
  return <section className="grid gap-6 rounded-2xl border border-border bg-card p-5" aria-busy={busy}>
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-semibold">Tickets and sales</h3><button type="button" className={button} disabled={busy} onClick={() => { if (window.confirm("Reload saved ticket settings? Unsaved changes will be discarded.")) void load() }}>Reload saved settings</button></div>
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    {notice ? <p role="status" className="text-sm">{notice}</p> : null}
    {!offering && busy ? <p role="status">Loading ticket settings…</p> : null}
    {offering ? <>
      {!canConfigure ? <p className="text-sm">This event uses free registration. To add paid tickets, first save it as a draft in Edit event. Events with existing registrations cannot be converted.</p> : null}
      <form key={`${paid?.offering_version ?? "free"}:${revision}`} onSubmit={save} className="grid gap-4">
        <fieldset disabled={busy || !canConfigure} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-sm text-muted-foreground">{paid ? "Changes apply to new purchases. Existing purchases keep their original price." : "Configure paid tickets while this event is a draft, then publish when ready."}</legend>
          <label className="text-sm font-medium">Ticket price (USD)<input className={field} name="price" type="number" inputMode="decimal" min="0.01" max="999999.99" step="0.01" defaultValue={paid ? (paid.price.unit_amount_minor / 100).toFixed(2) : ""} required /></label>
          <label className="text-sm font-medium">Maximum tickets per purchase<input className={field} name="quantity" type="number" min="1" max="100" step="1" defaultValue={paid?.max_per_purchase ?? ""} required /></label>
          <label className="text-sm font-medium">Tax treatment<select className={field} name="tax" defaultValue={paid?.price.tax_behavior ?? ""} required><option value="" disabled>Select tax treatment</option><option value="inclusive">Tax included in price</option><option value="exclusive">Applicable tax added at checkout</option></select></label>
          <label className="text-sm font-medium">Ticket sales<select className={field} name="status" defaultValue={paid?.sales_status ?? "paused"}><option value="paused">Paused</option><option value="on_sale">On sale when published</option></select></label>
        </fieldset>
        <button className={`${button} w-fit bg-primary text-primary-foreground`} disabled={busy || !canConfigure}>{busy ? "Please wait…" : "Save ticket settings"}</button>
      </form>
    </> : null}
    <div className="grid gap-3"><h3 className="text-lg font-semibold">Purchases</h3><p className="text-sm text-muted-foreground">Each paid ticket has its own entry in Attendees and its own admission code. Handle refunds in the payment provider dashboard; this list shows the reconciled result.</p>
      {sales?.purchases.length === 0 ? <p className="text-sm">No purchases yet.</p> : null}
      {sales?.purchases.map(purchase => <article key={purchase.id} className="grid gap-1 rounded-xl border border-border p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2"><strong>{purchase.buyer_name}</strong><span>{purchase.status.replaceAll("_", " ")}</span></div>
        <p className="break-all">{purchase.buyer_email}</p><p>{purchase.quantity} tickets × {money(purchase.unit_amount_minor)}{purchase.total_minor !== null ? ` · Total ${money(purchase.total_minor)}` : " · Payment not confirmed"}</p>
        <p className="break-all text-xs text-muted-foreground">Reference: {purchase.id}</p>
        {purchase.reconciliation_failures > 0 ? <p className="text-sm">Payment reconciliation needs attention ({purchase.reconciliation_failures} unsuccessful attempts).</p> : null}
      </article>)}
      {sales?.next_cursor ? <button type="button" className={button} disabled={busy} onClick={() => void more()}>Load more purchases</button> : null}
    </div>
  </section>
}
