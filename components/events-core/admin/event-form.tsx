"use client"

import { useCallback, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import type { EventsAdminAdapter } from "@/lib/events-core/adapter"
import { isoToLocalInput, localInputToIso, TIMEZONE_OFFSETS } from "@/lib/events-core/format"
import { isEstlError, type EstlError, type EventCore, type EventInput, type EventStatus } from "@/lib/events-core/types"
import { InlineError } from "../shared"

const STATUS_OPTIONS: EventStatus[] = ["draft", "published", "cancelled"]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function EventForm({
  adapter,
  event,
  onDone,
  onCancel,
}: {
  adapter: EventsAdminAdapter
  event?: EventCore
  onDone: (id: string) => void
  onCancel: () => void
}) {
  const isEdit = Boolean(event)
  const [offset, setOffset] = useState(TIMEZONE_OFFSETS[1].value.replace("-central-dst", ""))

  const [title, setTitle] = useState(event?.title ?? "")
  const [slug, setSlug] = useState(event?.slug ?? "")
  const [slugDirty, setSlugDirty] = useState(Boolean(event))
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "draft")
  const [startsAt, setStartsAt] = useState(isoToLocalInput(event?.starts_at, offset))
  const [endsAt, setEndsAt] = useState(isoToLocalInput(event?.ends_at, offset))
  const [location, setLocation] = useState(event?.location ?? "")
  const [imageUrl, setImageUrl] = useState(event?.image_url ?? "")
  const [capacity, setCapacity] = useState(event?.capacity != null ? String(event.capacity) : "")
  const [description, setDescription] = useState(event?.description ?? "")

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<EstlError | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const effectiveSlug = useMemo(() => (slugDirty ? slug : slugify(title)), [slug, slugDirty, title])

  const submit = useCallback(async () => {
    setError(null)
    setFieldError(null)
    if (title.trim().length < 3) return setFieldError("Title is required.")
    if (!effectiveSlug) return setFieldError("A URL slug is required.")
    const startIso = localInputToIso(startsAt, offset)
    const endIso = localInputToIso(endsAt, offset)
    if (!startIso) return setFieldError("A valid start date and time is required.")
    if (!endIso) return setFieldError("A valid end date and time is required.")
    if (new Date(endIso) <= new Date(startIso)) return setFieldError("The end time must be after the start time.")
    const capacityNum = capacity.trim() === "" ? null : Number(capacity)
    if (capacityNum != null && (!Number.isSafeInteger(capacityNum) || capacityNum <= 0)) {
      return setFieldError("Capacity must be a positive whole number, or left blank for unlimited.")
    }

    const payload: EventInput = {
      title: title.trim(),
      slug: effectiveSlug,
      starts_at: startIso,
      ends_at: endIso,
      status,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      location: location.trim() || null,
      capacity: capacityNum,
    }

    setBusy(true)
    const result = event
      ? await adapter.updateEvent({ eventId: event.id, event: payload })
      : await adapter.createEvent(payload)
    setBusy(false)
    if (isEstlError(result)) {
      setError(result.error)
      return
    }
    onDone(result.data.id)
  }, [adapter, event, title, effectiveSlug, startsAt, endsAt, offset, status, description, imageUrl, location, capacity, onDone])

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
  const labelClass = "text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground"

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <h3 className="font-serif text-2xl text-foreground">{isEdit ? "Edit event" : "Create event"}</h3>

      <label className="grid gap-1.5">
        <span className={labelClass}>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClass}>URL slug</span>
        <input
          value={effectiveSlug}
          onChange={(e) => {
            setSlugDirty(true)
            setSlug(slugify(e.target.value))
          }}
          className={`${inputClass} font-mono text-xs`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelClass}>Starts</span>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Ends</span>
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className={labelClass}>Timezone</span>
        <select value={offset} onChange={(e) => setOffset(e.target.value)} className={inputClass}>
          {TIMEZONE_OFFSETS.map((tz) => (
            <option key={tz.label} value={tz.value.replace("-central-dst", "")}>
              {tz.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelClass}>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Capacity (blank = unlimited)</span>
          <input value={capacity} onChange={(e) => setCapacity(e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className={labelClass}>Location</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClass}>Image URL</span>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={`${inputClass} font-mono text-xs`} />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClass}>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} />
      </label>

      {fieldError ? <p className="text-sm font-bold text-[#c0563d]">{fieldError}</p> : null}
      {error ? <InlineError error={error} onRetry={() => void submit()} /> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground transition hover:bg-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border bg-card px-6 py-3 text-sm font-extrabold text-foreground transition hover:border-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
