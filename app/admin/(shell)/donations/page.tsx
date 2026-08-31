"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, HeartHandshake, ArrowUpDown } from "lucide-react"
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
import { donations, type DonationStatus } from "@/lib/admin/mock/donations"
import { formatCurrency, formatDate } from "@/lib/admin/format"

const STATUS_OPTIONS: DonationStatus[] = ["Completed", "Pending", "Failed", "Refunded"]

export default function DonationsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all")
  const [sort, setSort] = useState<"newest" | "oldest">("newest")

  const filtered = useMemo(() => {
    let rows = donations.filter((d) => {
      const matchesSearch =
        search.trim().length === 0 ||
        d.donor.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()) ||
        d.referenceId.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || d.status === statusFilter
      const matchesFrequency = frequencyFilter === "all" || d.frequency === frequencyFilter
      return matchesSearch && matchesStatus && matchesFrequency
    })
    rows = rows.sort((a, b) =>
      sort === "newest" ? +new Date(b.date) - +new Date(a.date) : +new Date(a.date) - +new Date(b.date),
    )
    return rows
  }, [search, statusFilter, frequencyFilter, sort])

  const hasActiveFilters = search.length > 0 || statusFilter !== "all" || frequencyFilter !== "all"
  const totalCompleted = donations.filter((d) => d.status === "Completed").reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Donations"
        description="Read-only visibility into gifts processed through the public donation flow. Payment processing is managed by Stripe."
      />

      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{formatCurrency(totalCompleted)}</span> completed across{" "}
        <span className="font-medium text-foreground">{donations.filter((d) => d.status === "Completed").length}</span>{" "}
        gifts shown below.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, email, reference…"
            className="pl-8"
            aria-label="Search donations"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger size="sm" className="w-[130px]" aria-label="Filter by frequency">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">One-time & Monthly</SelectItem>
              <SelectItem value="One-time">One-time</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
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
          <Button variant="outline" size="sm" onClick={() => setSort(sort === "newest" ? "oldest" : "newest")} className="gap-1.5">
            <ArrowUpDown className="size-3.5" />
            {sort === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        hasActiveFilters ? (
          <AdminEmptyState
            icon={Search}
            title="No matching donations"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("all")
                  setFrequencyFilter("all")
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <AdminEmptyState
            icon={HeartHandshake}
            title="No donations yet"
            description="Gifts made through the public donation form will appear here once they're processed."
          />
        )
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link href={`/admin/donations/${d.id}`} className="block font-medium text-foreground hover:underline">
                      {d.donor}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/admin/donations/${d.id}`} className="block">
                      {d.email}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/admin/donations/${d.id}`} className="block">
                      {formatCurrency(d.amount)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/admin/donations/${d.id}`} className="block">
                      {d.frequency}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/donations/${d.id}`} className="block">
                      <StatusBadge status={d.status} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`/admin/donations/${d.id}`} className="block">
                      {formatDate(d.date)}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <Link href={`/admin/donations/${d.id}`} className="block">
                      {d.referenceId}
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
