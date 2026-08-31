import Link from "next/link"
import { Inbox, HeartHandshake, Images, Users, ImagePlus, Pencil, UserPlus, ClipboardCheck } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatCard } from "@/components/admin/stat-card"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { submissions } from "@/lib/admin/mock/submissions"
import { donations } from "@/lib/admin/mock/donations"
import { galleryImages } from "@/lib/admin/mock/gallery"
import { staffMembers } from "@/lib/admin/mock/staff"
import { formatCurrency, timeAgo } from "@/lib/admin/format"

export default function AdminDashboardPage() {
  const newSubmissions = submissions.filter((s) => s.status === "New").length
  const donationsThisMonth = donations.filter((d) => d.status === "Completed").length
  const publishedImages = galleryImages.filter((g) => g.published).length
  const activeStaff = staffMembers.filter((s) => s.status === "Active").length

  const recentSubmissions = [...submissions]
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 5)
  const recentDonations = [...donations]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5)

  const quickActions = [
    { label: "Review submissions", href: "/admin/submissions", icon: ClipboardCheck },
    { label: "Add gallery photo", href: "/admin/gallery", icon: ImagePlus },
    { label: "Edit homepage content", href: "/admin/content/home", icon: Pencil },
    { label: "Invite staff member", href: "/admin/staff", icon: UserPlus },
  ]

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Dashboard"
        description="A quick look at what needs attention across the foundation's site."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New submissions" value={newSubmissions} icon={Inbox} hint="Awaiting review" />
        <StatCard label="Donations this month" value={donationsThisMonth} icon={HeartHandshake} hint="Completed" />
        <StatCard label="Published gallery images" value={publishedImages} icon={Images} hint={`${galleryImages.length} total`} />
        <StatCard label="Active staff" value={activeStaff} icon={Users} hint={`${staffMembers.length} total accounts`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent submissions */}
        <div className="flex flex-col rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Form Submissions</h2>
            <Link href="/admin/submissions" className="text-xs text-accent-foreground hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentSubmissions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/submissions/${s.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {s.type} · {timeAgo(s.submittedAt)}
                    </span>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="flex flex-col gap-2 p-4">
            {quickActions.map((action) => (
              <Button key={action.href} variant="outline" className="justify-start" asChild>
                <Link href={action.href}>
                  <action.icon className="size-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent donations */}
        <div className="flex flex-col rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Donations</h2>
            <Link href="/admin/donations" className="text-xs text-accent-foreground hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentDonations.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/admin/donations/${d.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{d.donor}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {formatCurrency(d.amount)} · {d.frequency} · {timeAgo(d.date)}
                    </span>
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Gallery / staff summary */}
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Gallery Activity</h2>
            </div>
            <div className="flex flex-col gap-2 p-5 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{publishedImages}</span> of{" "}
                {galleryImages.length} images published
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">1</span> new photo submission awaiting promotion
              </p>
              <Link href="/admin/gallery" className="mt-1 text-xs text-accent-foreground hover:underline">
                Manage gallery
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Staff Access</h2>
            </div>
            <div className="flex flex-col gap-2 p-5 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{activeStaff}</span> active ·{" "}
                <span className="font-medium text-foreground">
                  {staffMembers.filter((s) => s.status === "Invited").length}
                </span>{" "}
                invited
              </p>
              <Link href="/admin/staff" className="mt-1 text-xs text-accent-foreground hover:underline">
                Manage staff
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
