"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

// Renders a QR entirely client-side from an opaque ticket token. No network,
// no third-party image service. The token is treated as an opaque string.
export function QrCode({ value, size = 224, label }: { value: string; size?: number; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#3a2a1c", light: "#ffffff" },
    }).catch(() => {
      if (!cancelled) setError(true)
    })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (error) {
    return (
      <div
        className="grid place-items-center rounded-2xl border border-dashed border-[#d9c6ad] bg-card p-6 text-center text-xs text-muted-foreground"
        style={{ width: size, height: size }}
      >
        This ticket code could not be rendered.
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-2xl bg-card shadow-[0_10px_30px_rgba(111,75,43,0.12)]"
      role="img"
      aria-label={label ?? "Ticket QR code"}
    />
  )
}
