import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "vitest"
import { JSDOM } from "jsdom"
import { act } from "react"
import type { Root } from "react-dom/client"
import type { EventsAdminAdapter } from "../lib/events-core/adapter"
import type { CheckInResult, EventCore } from "../lib/events-core/types"

let dom: JSDOM
let root: Root
let container: HTMLDivElement
let previous: Map<string, PropertyDescriptor | undefined>

beforeEach(async () => {
  dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://preview.example.com" })
  previous = new Map()
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
    navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
  container = document.createElement("div")
  document.body.append(container)
  const { createRoot } = await import("react-dom/client")
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  Reflect.deleteProperty(dom.window, "BarcodeDetector")
  dom.window.close()
  for (const [key, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
})

async function mount(results: CheckInResult[]) {
  const { CheckInPanel } = await import("../components/events-core/admin/check-in-panel")
  let calls = 0
  const adapter = { checkIn: async () => ({ data: results[calls++] }) } as unknown as EventsAdminAdapter
  await act(async () => root.render(<CheckInPanel adapter={adapter} eventId="event" />))
  await act(async () => {
    const input = container.querySelector<HTMLInputElement>('input[type="text"], input:not([type])')!
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value")!.set!.call(input, "a".repeat(43))
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }))
  })
  return () => calls
}

async function submit() {
  await act(async () => {
    container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }))
  })
}

test("immediate second admission shows Already admitted even when its timestamp is identical", async () => {
  const at = new Date().toISOString()
  const calls = await mount([
    { id: "registration", checked_in_at: at, already_checked_in: false },
    { id: "registration", checked_in_at: at, already_checked_in: true },
  ])
  await submit()
  assert.equal(calls(), 1)
  assert.match(container.textContent!, /Admitted at/)
  await submit()
  assert.equal(calls(), 2)
  assert.match(container.textContent!, /Already admitted/)
  assert.doesNotMatch(container.textContent!, /Admitted at/)
})

test("a first admission with a server timestamp far behind the browser is still a first admission", async () => {
  await mount([{ id: "registration", checked_in_at: "2000-01-01T00:00:00Z", already_checked_in: false }])
  await submit()
  assert.match(container.textContent!, /Admitted at/)
  assert.doesNotMatch(container.textContent!, /Already admitted/)
})

test("an old response without authoritative repeat status fails closed", async () => {
  await mount([{ id: "registration", checked_in_at: new Date().toISOString() } as CheckInResult])
  await submit()
  assert.match(container.textContent!, /Not confirmed/)
  assert.doesNotMatch(container.textContent!, /Admitted at/)
})

test("the rendered ticket explains how to retain it without claiming an email was sent", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server")
  const { Ticket } = await import("../components/events-core/public/ticket")
  const event = { title: "Sandbox event", starts_at: "2099-01-01T10:00:00Z", ends_at: "2099-01-01T11:00:00Z", location: "Studio" } as EventCore
  const html = renderToStaticMarkup(<Ticket event={event} token={"a".repeat(43)} />)
  assert.match(html, /Save a screenshot/)
  assert.match(html, /This ticket is not emailed/)
  assert.doesNotMatch(html, /emailed a copy|Demo data/)
})

async function mountManual(checkIn: EventsAdminAdapter["checkIn"], overrides = {}) {
  const { AttendeesPanel } = await import("../components/events-core/admin/attendees-panel")
  const attendee = { id: "registration", guest_info: { name: "Test Guest", email: "guest@example.com" },
    status: "registered", created_at: "2026-01-01T00:00:00Z", checked_in_at: null,
    staff_registered_by: null, staff_registered_at: null, ...overrides }
  const adapter = { checkIn, listAttendees: async () => ({ data: { attendees: [attendee], next_cursor: null } }) } as unknown as EventsAdminAdapter
  await act(async () => root.render(<AttendeesPanel adapter={adapter} eventId="event" reloadKey={0} />))
}

function manualButton() { return container.querySelector<HTMLButtonElement>('button[aria-label="Check in Test Guest"]') }

test("attendee list admits by registration ID without a token and updates displayed status", async () => {
  await mountManual(async (input) => {
    assert.deepEqual(input, { eventId: "event", registration_id: "registration" })
    return { data: { id: "registration", checked_in_at: "2026-01-02T00:00:00Z", already_checked_in: false } }
  })
  await act(async () => manualButton()!.click())
  assert.equal(container.querySelector('[role="status"]')?.textContent, "Admitted")
  assert.match(container.textContent!, /Checked in/)
  assert.equal(manualButton(), null)
})

test("stale attendee list reports Already admitted from the server", async () => {
  await mountManual(async () => ({ data: { id: "registration", checked_in_at: "2026-01-02T00:00:00Z", already_checked_in: true } }))
  await act(async () => manualButton()!.click())
  assert.equal(container.querySelector('[role="status"]')?.textContent, "Already admitted")
  assert.equal(manualButton(), null)
})

test("manual admission rejects missing flag, mismatched ID and transport failure", async () => {
  const results = [
    { data: { id: "registration", checked_in_at: "2026-01-02T00:00:00Z" } },
    { data: { id: "wrong", checked_in_at: "2026-01-02T00:00:00Z", already_checked_in: false } },
  ]
  await mountManual(async () => {
    if (results.length) return results.shift() as Awaited<ReturnType<EventsAdminAdapter["checkIn"]>>
    throw new Error("network unavailable")
  })
  for (let i = 0; i < 3; i++) {
    await act(async () => manualButton()!.click())
    assert.match(container.querySelector('[role="alert"]')!.textContent!, /Not confirmed/)
    assert.equal(container.querySelector('[role="status"]'), null)
    assert.equal(manualButton()!.disabled, false)
  }
})

test("rapid manual submissions call check-in once while awaiting the server", async () => {
  let resolve!: (value: Awaited<ReturnType<EventsAdminAdapter["checkIn"]>>) => void
  let calls = 0
  await mountManual(() => { calls++; return new Promise((r) => { resolve = r }) })
  await act(async () => { const button = manualButton()!; button.click(); button.click() })
  assert.equal(calls, 1)
  assert.equal(manualButton()!.disabled, true)
  await act(async () => resolve({ data: { id: "registration", checked_in_at: "2026-01-02T00:00:00Z", already_checked_in: false } }))
  assert.equal(manualButton(), null)
})

for (const status of ["cancelled", "waitlisted"]) {
  test(`no manual admission control for ${status} attendees`, async () => {
    await mountManual(async () => { throw new Error("must not call") }, { status })
    assert.equal(manualButton(), null)
  })
}

test("camera scanning remains available without native BarcodeDetector", async () => {
  Reflect.deleteProperty(window, "BarcodeDetector")
  Object.defineProperty(navigator, "mediaDevices", { configurable:true, value:{getUserMedia:async()=>{throw new Error("Not invoked")}} })
  const { QrScanner } = await import("../components/events-core/qr-scanner")
  await act(async()=>root.render(<QrScanner onDetected={()=>{}} />))
  assert.match(container.textContent!, /Scan a ticket/)
  assert.doesNotMatch(container.textContent!, /isn't available/)
  assert.equal(container.querySelector("button")?.disabled,false)
})

test("fallback decoder reads an actual ticket QR image", async () => {
  const { default: QRCode } = await import("qrcode")
  const { default: jsQR } = await import("jsqr")
  const token = "x".repeat(43)
  const qr = QRCode.create(token)
  const scale=6, margin=4, width=(qr.modules.size+margin*2)*scale
  const pixels=new Uint8ClampedArray(width*width*4).fill(255)
  for(let y=0;y<qr.modules.size;y++) for(let x=0;x<qr.modules.size;x++) {
    if(!qr.modules.get(y,x)) continue
    for(let dy=0;dy<scale;dy++) for(let dx=0;dx<scale;dx++) {
      const offset=(((y+margin)*scale+dy)*width+(x+margin)*scale+dx)*4
      pixels[offset]=pixels[offset+1]=pixels[offset+2]=0
    }
  }
  const { createJsQrDetector } = await import("../lib/events-core/qr-detector")
  const canvas = document.createElement("canvas")
  let drawn = false
  const context = {
    drawImage: (_video: unknown, x: number, y: number, w: number, h: number) => {
      assert.deepEqual([x, y, w, h], [0, 0, width, width])
      drawn = true
    },
    getImageData: () => ({ data: pixels, width, height: width }),
  } as unknown as CanvasRenderingContext2D
  const detector = createJsQrDetector(jsQR, canvas, context)
  const video = { videoWidth: width, videoHeight: width } as HTMLVideoElement
  assert.deepEqual(await detector.detect(video), [{ rawValue: token }])
  assert.equal(drawn, true)
  assert.equal(canvas.width, width)
  assert.equal(canvas.height, width)
  assert.equal(jsQR(new Uint8ClampedArray(width*width*4).fill(255),width,width),null)
})

test("leaving scanner while camera permission is pending stops the late stream", async () => {
  let resolveCamera!: (stream: MediaStream)=>void
  let stopped=0
  Object.defineProperty(navigator,"mediaDevices",{configurable:true,value:{getUserMedia:()=>new Promise<MediaStream>(resolve=>{resolveCamera=resolve})}})
  Object.defineProperty(window,"BarcodeDetector",{configurable:true,value:class {static async getSupportedFormats(){return ["qr_code"]} async detect(){return []}}})
  const {QrScanner}=await import("../components/events-core/qr-scanner")
  await act(async()=>root.render(<QrScanner onDetected={()=>assert.fail("unexpected admission")} />))
  await act(async()=>container.querySelector("button")!.click())
  await act(async()=>root.render(null))
  await act(async()=>resolveCamera({getTracks:()=>[{stop:()=>{stopped++}}]} as unknown as MediaStream))
  assert.equal(stopped,1)
})
