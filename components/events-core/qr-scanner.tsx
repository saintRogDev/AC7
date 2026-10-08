"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff } from "lucide-react"
import { chooseQrDetector, loadJsQrDetector, type NativeQrDetector, type QrDetector } from "../../lib/events-core/qr-detector"

// Decode locally: native BarcodeDetector when available, lazy-loaded jsQR otherwise.
// Camera frames and ticket tokens are never uploaded to a decoding service.

type ScannerState = "checking" | "unsupported" | "idle" | "starting" | "scanning" | "denied" | "error"

export function QrScanner({ onDetected }: { onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const detectorRef = useRef<QrDetector | null>(null)
  const generationRef = useRef(0)
  const startingRef = useRef(false)
  const [state, setState] = useState<ScannerState>("checking")

  const supported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia

  const stop = useCallback(() => {
    generationRef.current += 1
    startingRef.current = false
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    // Capability detection happens after hydration, keeping the initial HTML stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(supported ? "idle" : "unsupported")
    return () => stop()
  }, [supported, stop])

  const start = useCallback(async () => {
    if (!supported || startingRef.current || streamRef.current) return
    startingRef.current = true
    const generation = ++generationRef.current
    setState("starting")
    try {
      const Native = (window as unknown as { BarcodeDetector?: NativeQrDetector }).BarcodeDetector
      const detector = await chooseQrDetector(Native, loadJsQrDetector)
      if (generation !== generationRef.current) return
      detectorRef.current = detector
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (generation !== generationRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }
      streamRef.current = stream
      const video = videoRef.current
      if (!video) { stop(); setState("error"); return }
      video.srcObject = stream
      await video.play()
      if (generation !== generationRef.current) return
      startingRef.current = false
      setState("scanning")

      let lastScan = 0
      const tick = async (now: number) => {
        if (generation !== generationRef.current) return
        if (now - lastScan < 150) { rafRef.current = requestAnimationFrame(tick); return }
        lastScan = now
        const detector = detectorRef.current
        const el = videoRef.current
        if (!detector || !el || el.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }
        try {
          const codes = await detector.detect(el)
          if (generation !== generationRef.current) return
          const hit = codes.find((c) => c.rawValue)
          if (hit) {
            stop()
            setState("idle")
            onDetected(hit.rawValue.trim())
            return
          }
        } catch (cause) {
          if (generation !== generationRef.current) return
          if (cause instanceof Error && cause.name === "NotSupportedError") {
            try {
              const fallback = await loadJsQrDetector()
              if (generation !== generationRef.current) return
              detectorRef.current = fallback
            } catch {
              if (generation !== generationRef.current) return
              stop()
              setState("error")
              return
            }
          }
          // Other per-frame failures may be transient.
        }
        if (generation === generationRef.current) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (cause) {
      if (generation !== generationRef.current) return
      stop()
      const denied = cause instanceof DOMException && (cause.name === "NotAllowedError" || cause.name === "SecurityError")
      setState(denied ? "denied" : "error")
    }
  }, [supported, onDetected, stop])

  if (state === "unsupported" || state === "denied" || state === "error") {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CameraOff className="size-4" />
          <p className="text-sm font-extrabold">
            {state === "unsupported"
              ? "Camera scanning isn't available on this device"
              : state === "denied"
                ? "Camera permission was denied"
                : "The camera couldn't be started"}
          </p>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {state === "unsupported"
            ? "This browser does not provide camera scanning. Try a supported browser over HTTPS."
            : state === "denied"
              ? "Allow camera access in your browser settings to scan tickets."
              : "The camera could not start. Check that it is connected and not being used by another app."}
          {" "}You can also use manual ticket entry below or find the guest in Attendees.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-[#2a1e14]">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" aria-label="Camera preview" />
        {state !== "scanning" ? (
          <div className="absolute inset-0 grid place-items-center text-center text-xs text-white/70">
            {state === "starting" ? "Starting camera…" : "Camera preview appears here"}
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-accent/80" aria-hidden="true" />
        )}
      </div>
      {state === "scanning" ? (
        <button
          type="button"
          onClick={() => {
            stop()
            setState("idle")
          }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-extrabold text-foreground transition hover:border-primary"
        >
          <CameraOff className="size-3.5" /> Stop camera
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={state === "starting" || state === "checking"}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground transition hover:bg-primary"
        >
          <Camera className="size-3.5" /> Scan a ticket
        </button>
      )}
    </div>
  )
}
