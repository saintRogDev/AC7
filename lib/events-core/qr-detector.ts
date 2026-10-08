import type jsQR from "jsqr"

export interface QrDetector {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

export type NativeQrDetector = {
  new (options: { formats: string[] }): QrDetector
  getSupportedFormats(): Promise<string[]>
}

export async function chooseQrDetector(
  Native: NativeQrDetector | undefined,
  fallback: () => Promise<QrDetector>,
): Promise<QrDetector> {
  if (Native) {
    try {
      if ((await Native.getSupportedFormats()).includes("qr_code")) {
        return new Native({ formats: ["qr_code"] })
      }
    } catch {
      /* Missing capability or initialization failure: use local decoding. */
    }
  }
  return fallback()
}

export function createJsQrDetector(
  decode: typeof jsQR,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): QrDetector {
  return {
    async detect(video) {
      if (!video.videoWidth || !video.videoHeight) return []
      const scale = Math.min(
        1,
        640 / Math.max(video.videoWidth, video.videoHeight),
      )
      const width = Math.max(1, Math.round(video.videoWidth * scale))
      const height = Math.max(1, Math.round(video.videoHeight * scale))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      context.drawImage(video, 0, 0, width, height)
      const pixels = context.getImageData(0, 0, width, height)
      const code = decode(pixels.data, pixels.width, pixels.height, {
        inversionAttempts: "dontInvert",
      })
      return code ? [{ rawValue: code.data }] : []
    },
  }
}

export async function loadJsQrDetector(): Promise<QrDetector> {
  const { default: jsQR } = await import("jsqr")
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) throw new Error("Canvas unavailable")
  return createJsQrDetector(jsQR, canvas, context)
}
