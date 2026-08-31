"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Paperclip, Inbox, ArrowUpDown } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"
import { StatusBadge } from "@/components/admin/status-badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { submissions, type SubmissionStatus, type SubmissionType } from "@/lib/admin/mock/submissions"
import { formatDateTime } from "@/lib/admin/format"

const TYPE_OPTIONS: SubmissionType[] = [
  "Contact",
  "Share a Memory",
  "Photo Submission",
  "Volunteer Interest",
  "Scholarship Interest",
]
const STATUS_OPTIONS: SubmissionStatus[] = ["New", "Reviewed", "Archived"]

export default function SubmissionsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sort, setSort] = useState<"newest" | "oldest">("newest")

  const filtered = useMemo(() => {
    let rows = submissions.filter((s) => {
      const matchesSearch =
        search.trim().length === 0 ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.subject ?? "").toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || s.type === typeFilter
      const matchesStatus = statusFilter === "all" || s.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
    rows = rows.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.submittedAt) - +new Date(a.submittedAt)
        : +new Date(a.submittedAt) - +new Date(b.submittedAt),
    )
    return rows
  }, [search, typeFilter, statusFilter, sort])

  const hasActiveFilters = search.length > 0 || typeFilter !== "all" || statusFilter !== "all"

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Form Submissions"
        description="Contact, memory, photo, volunteer, and scholarship interest forms submitted from the public site."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="pl-8"
            aria-label="Search submissions"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger size="sm" className="w-[150px]" aria-label="Filter by form type">
              <SelectValue placeholder="Form type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger size="sm" className="w-[130px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
            className="gap-1.5"
          >
            <ArrowUpDown className="size-3.5" />
            {sort === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        hasActiveFilters ? (
          <AdminEmptyState
            icon={Search}
            title="No matching submissions"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setTypeFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <AdminEmptyState
            icon={Inbox}
            title="No new submissions"
            description="New contact and memory submissions will appear here as visitors submit forms on the public site."
          />
        )
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Attachment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="cursor-pointer">
                  <TableCell className="whitespace-nowrap">
                    <Link href={`/admin/submissions/${s.id}`} className="block text-sm text-foreground hover:underline">
                      {s.type}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/submissions/${s.id}`} className="block font-medium text-foreground hover:underline">
                      {s.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/admin/submissions/${s.id}`} className="block">
                      {s.email}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/admin/submissions/${s.id}`} className="block">
                      {formatDateTime(s.submittedAt)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/submissions/${s.id}`} className="block">
                      <StatusBadge status={s.status} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/admin/submissions/${s.id}`} className="flex items-center justify-center">
                      {s.attachments.length > 0 ? (
                        <Paperclip className="size-4 text-muted-foreground" aria-label={`${s.attachments.length} attachment(s)`} />
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
