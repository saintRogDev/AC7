"use client"

import { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, Save } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getContentPage } from "@/lib/admin/mock/content"
import { toast } from "sonner"

export default function ContentEditorPage() {
  const params = useParams<{ slug: string }>()
  const page = getContentPage(params.slug)
  if (!page) notFound()

  const [values, setValues] = useState(page.fields.map((f) => f.value))

  function update(index: number, value: string) {
    setValues((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  function handleSave() {
    toast.success("Changes saved", { description: "This is a demo — changes aren't published to the live site." })
  }

  function handlePreview() {
    toast.info("Preview isn't connected in this demo.")
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <AdminPageHeader
        title={page.name}
        breadcrumbs={[{ label: "Site Content", href: "/admin/content" }, { label: page.name }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/content">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="size-4" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="size-4" />
              Save
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <StatusBadge status={page.status} />
        <span>Last updated {new Date(page.lastUpdated).toLocaleDateString()} by {page.updatedBy}</span>
      </div>

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6">
        {page.fields.map((field, i) => (
          <div key={field.label} className="flex flex-col gap-1.5">
            <Label htmlFor={`field-${i}`}>{field.label}</Label>
            {field.multiline ? (
              <Textarea id={`field-${i}`} value={values[i]} onChange={(e) => update(i, e.target.value)} rows={3} />
            ) : (
              <Input id={`field-${i}`} value={values[i]} onChange={(e) => update(i, e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
