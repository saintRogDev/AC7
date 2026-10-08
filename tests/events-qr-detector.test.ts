import assert from "node:assert/strict"
import { test } from "vitest"
import {
  chooseQrDetector,
  createJsQrDetector,
} from "../lib/events-core/qr-detector.ts"

for (const mode of [
  "missing",
  "no-qr",
  "query-rejects",
  "constructor-throws",
  "supported",
] as const) {
  test(`QR capability selection: ${mode}`, async () => {
    let constructed = 0
    let fallbackCalls = 0
    class Native {
      static async getSupportedFormats() {
        if (mode === "query-rejects") throw new Error("Unavailable")
        return mode === "no-qr" ? ["ean_13"] : ["qr_code"]
      }
      constructor() {
        constructed++
        if (mode === "constructor-throws") throw new Error("Unavailable")
      }
      async detect() {
        return []
      }
    }
    const fallback = {
      async detect() {
        return [{ rawValue: "fallback" }]
      },
    }
    const result = await chooseQrDetector(
      mode === "missing" ? undefined : Native,
      async () => {
        fallbackCalls++
        return fallback
      },
    )
    assert.equal(fallbackCalls, mode === "supported" ? 0 : 1)
    assert.equal(
      constructed,
      ["supported", "constructor-throws"].includes(mode) ? 1 : 0,
    )
    if (mode !== "supported") assert.equal(result, fallback)
  })
}

test("canvas wrapper scales frames and avoids resizing unchanged dimensions", async () => {
  let width = 0,
    height = 0,
    resizes = 0
  const canvas = {
    get width() {
      return width
    },
    set width(value) {
      width = value
      resizes++
    },
    get height() {
      return height
    },
    set height(value) {
      height = value
      resizes++
    },
  } as HTMLCanvasElement
  const pixels = new Uint8ClampedArray(640 * 360 * 4)
  const context = {
    drawImage: (_video: unknown, ...dimensions: number[]) =>
      assert.deepEqual(dimensions, [0, 0, 640, 360]),
    getImageData: (...dimensions: number[]) => {
      assert.deepEqual(dimensions, [0, 0, 640, 360])
      return { data: pixels, width: 640, height: 360 }
    },
  } as unknown as CanvasRenderingContext2D
  const detector = createJsQrDetector(
    (data, w, h, options) => {
      assert.equal(data, pixels)
      assert.deepEqual(
        [w, h, options?.inversionAttempts],
        [640, 360, "dontInvert"],
      )
      return null
    },
    canvas,
    context,
  )
  const video = { videoWidth: 1920, videoHeight: 1080 } as HTMLVideoElement
  assert.deepEqual(await detector.detect(video), [])
  assert.deepEqual(await detector.detect(video), [])
  assert.equal(resizes, 2)
})
