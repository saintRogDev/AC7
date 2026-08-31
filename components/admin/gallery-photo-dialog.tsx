"use client"

import { useEffect, useState } from "react"
import { ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { GalleryImage } from "@/lib/admin/mock/gallery"

interface GalleryPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image?: GalleryImage | null
  onSave: (values: { caption: string; alt: string; order: number; published: boolean; src: string }) => void
}

export function GalleryPhotoDialog({ open, onOpenChange, image, onSave }: GalleryPhotoDialogProps) {
  const isEdit = Boolean(image)
  const [caption, setCaption] = useState(image?.caption ?? "")
  const [alt, setAlt] = useState(image?.alt ?? "")
  const [order, setOrder] = useState(image?.order ?? 1)
  const [published, setPublished] = useState(image?.published ?? false)

  useEffect(() => {
    if (open) {
      setCaption(image?.caption ?? "")
      setAlt(image?.alt ?? "")
      setOrder(image?.order ?? 1)
      setPublished(image?.published ?? false)
    }
  }, [open, image])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Photo" : "Add Photo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the caption, ordering, or publish status for this photo." : "Add a new photo to the public gallery."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!isEdit && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/40 py-8 text-center text-sm text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden="true" />
              <span>Image upload isn&apos;t connected in this demo</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Graduation day, May 2019" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alt">Alt text</Label>
            <Input
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for screen readers"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="order">Display order</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 1)}
              />
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
              <Label htmlFor="published" className="text-sm">
                Published
              </Label>
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                caption,
                alt,
                order,
                published,
                src: image?.src ?? "/images/gallery/family-friends.jpg",
              })
            }
            disabled={!caption.trim() || !alt.trim()}
          >
            {isEdit ? "Save Changes" : "Add Photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
