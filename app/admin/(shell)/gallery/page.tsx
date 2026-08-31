"use client"

import { useState } from "react"
import Image from "next/image"
import { Grid3x3, List, ImagePlus, Images, Pencil, Trash2 } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"
import { GalleryPhotoDialog } from "@/components/admin/gallery-photo-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { galleryImages as initialImages, type GalleryImage } from "@/lib/admin/mock/gallery"
import { formatDate } from "@/lib/admin/format"
import { toast } from "sonner"

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sorted = [...images].sort((a, b) => a.order - b.order)

  function openAddDialog() {
    setEditingImage(null)
    setDialogOpen(true)
  }

  function openEditDialog(image: GalleryImage) {
    setEditingImage(image)
    setDialogOpen(true)
  }

  function handleSave(values: { caption: string; alt: string; order: number; published: boolean; src: string }) {
    if (editingImage) {
      setImages((prev) => prev.map((img) => (img.id === editingImage.id ? { ...img, ...values } : img)))
      toast.success("Photo updated")
    } else {
      setImages((prev) => [
        ...prev,
        { id: `img_${Date.now()}`, addedAt: new Date().toISOString(), ...values },
      ])
      toast.success("Photo added to gallery")
    }
    setDialogOpen(false)
  }

  function handleDelete() {
    if (!deletingId) return
    setImages((prev) => prev.filter((img) => img.id !== deletingId))
    setDeletingId(null)
    toast.success("Photo removed")
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Gallery"
        description="Manage the photos shown on the public gallery page. Submitted photos must be reviewed before they're promoted here."
        actions={
          <Button size="sm" onClick={openAddDialog}>
            <ImagePlus className="size-4" />
            Add Photo
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <AdminEmptyState
          icon={Images}
          title="No gallery images yet"
          description="Add a photo to feature it on the public gallery page."
          action={
            <Button size="sm" onClick={openAddDialog}>
              <ImagePlus className="size-4" />
              Add Photo
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex justify-end gap-1 rounded-md border border-border bg-card p-1 self-end">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              onClick={() => setView("grid")}
            >
              <Grid3x3 className="size-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="List view"
              onClick={() => setView("list")}
            >
              <List className="size-4" />
            </Button>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {sorted.map((img) => (
                <div key={img.id} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <Image src={img.src || "/placeholder.svg"} alt={img.alt} fill className="object-cover" />
                    <Badge variant={img.published ? "default" : "secondary"} className="absolute left-2 top-2">
                      {img.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">{img.caption}</p>
                    <span className="text-xs text-muted-foreground">Order {img.order}</span>
                    <div className="mt-auto flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(img)}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Remove ${img.caption}`}
                        onClick={() => setDeletingId(img.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
              {sorted.map((img) => (
                <div key={img.id} className="flex items-center gap-4 p-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={img.src || "/placeholder.svg"} alt={img.alt} fill className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{img.caption}</span>
                    <span className="text-xs text-muted-foreground">Order {img.order} · Added {formatDate(img.addedAt)}</span>
                  </div>
                  <Badge variant={img.published ? "default" : "secondary"}>{img.published ? "Published" : "Draft"}</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon-sm" aria-label={`Edit ${img.caption}`} onClick={() => openEditDialog(img)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Remove ${img.caption}`}
                      onClick={() => setDeletingId(img.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <GalleryPhotoDialog open={dialogOpen} onOpenChange={setDialogOpen} image={editingImage} onSave={handleSave} />

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the photo from the public gallery. This action can&apos;t be undone in this demo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
