"use client"

import { useMemo, useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { Archive, ArrowLeft, Check, Copy, Download, RotateCcw, CheckCheck } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getSubmissionById } from "@/lib/admin/mock/submissions"
import { formatDateTime } from "@/lib/admin/format"
import { toast } from "sonner"

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>()
  const initial = getSubmissionById(params.id)
  if (!initial) notFound()

  const [status, setStatus] = useState(initial.status)
  const [notes, setNotes] = useState(initial.notes)
  const [draftNote, setDraftNote] = useState("")

  const submission = useMemo(() => ({ ...initial, status, notes }), [initial, status, notes])

  function copyEmail() {
    navigator.clipboard?.writeText(submission.email)
    toast.success("Email copied to clipboard")
  }

  function addNote() {
    if (!draftNote.trim()) return
    setNotes((prev) => [...prev, { author: "Jordan Williams", date: new Date().toISOString(), note: draftNote.trim() }])
    setDraftNote("")
    toast.success("Note added")
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <AdminPageHeader
        title={submission.name}
        breadcrumbs={[
          { label: "Form Submissions", href: "/admin/submissions" },
          { label: submission.type },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/submissions">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            {status !== "Reviewed" && (
              <Button
                size="sm"
                onClick={() => {
                  setStatus("Reviewed")
                  toast.success("Marked as reviewed")
                }}
              >
                <Check className="size-4" />
                Mark Reviewed
              </Button>
            )}
            {status !== "Archived" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("Archived")
                  toast.success("Submission archived")
                }}
              >
                <Archive className="size-4" />
                Archive
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("New")
                  toast.success("Submission restored")
                }}
              >
                <RotateCcw className="size-4" />
                Restore
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={submission.status} />
            <span className="text-sm text-muted-foreground">{submission.type}</span>
          </div>
          <span className="text-sm text-muted-foreground">{formatDateTime(submission.submittedAt)}</span>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Sender name" value={submission.name} />
          <Field
            label="Sender email"
            value={
              <div className="flex items-center gap-2">
                <span>{submission.email}</span>
                <button
                  onClick={copyEmail}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy email address"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            }
          />
          {submission.phone && <Field label="Phone" value={submission.phone} />}
          {submission.subject && <Field label="Subject" value={submission.subject} />}
          {submission.fields &&
            Object.entries(submission.fields).map(([label, value]) => <Field key={label} label={label} value={value} />)}
          {submission.permissionToPublish !== undefined && (
            <Field
              label="Permission to publish"
              value={submission.permissionToPublish ? "Yes, may be published" : "No, do not publish"}
            />
          )}
        </dl>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</span>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{submission.message}</p>
        </div>

        {submission.attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attachments</span>
            <div className="flex flex-wrap gap-3">
              {submission.attachments.map((a) => (
                <div key={a.name} className="w-40 overflow-hidden rounded-md border border-border">
                  {a.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url || "/placeholder.svg"} alt={a.name} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-muted text-xs text-muted-foreground">
                      {a.name}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary/40 px-2 py-1.5">
                    <span className="truncate text-xs text-muted-foreground">{a.name}</span>
                    <button
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Download ${a.name}`}
                      onClick={() => toast.info("Attachment download isn't connected in this demo.")}
                    >
                      <Download className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Submission ID: <span className="font-mono">{submission.id}</span>
        </div>
      </div>

      {/* Internal notes */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Internal Notes</h2>
        {notes.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {notes.map((n, i) => (
              <li key={i} className="rounded-md bg-secondary/50 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{n.author}</span>
                  <span>{formatDateTime(n.date)}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{n.note}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No internal notes yet.</p>
        )}
        <div className="flex flex-col gap-2">
          <Textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Add a note for other staff members…"
            rows={2}
          />
          <Button size="sm" className="self-end" onClick={addNote} disabled={!draftNote.trim()}>
            <CheckCheck className="size-4" />
            Add Note
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}
