import Link from "next/link"
import { Pencil } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { contentPages } from "@/lib/admin/mock/content"
import { formatDate } from "@/lib/admin/format"

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Site Content"
        description="Edit structured content for each public page. Changes here are local to this demo and aren't published."
      />

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
        {contentPages.map((page) => (
          <div key={page.slug} className="flex items-center gap-4 p-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{page.name}</span>
              <span className="text-xs text-muted-foreground">
                Last updated {formatDate(page.lastUpdated)} by {page.updatedBy}
              </span>
            </div>
            <StatusBadge status={page.status} />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/content/${page.slug}`}>
                <Pencil className="size-3.5" />
                Edit
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
