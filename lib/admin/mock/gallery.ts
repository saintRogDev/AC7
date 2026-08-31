// Mock data for AC7 Admin — Gallery management

export interface GalleryImage {
  id: string
  src: string
  caption: string
  alt: string
  order: number
  published: boolean
  addedAt: string
}

export const galleryImages: GalleryImage[] = [
  {
    id: "img_1",
    src: "/images/gallery/formal-portrait.jpg",
    caption: "Ashton, formal portrait",
    alt: "Formal portrait of Ashton Carter in a suit",
    order: 1,
    published: true,
    addedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "img_2",
    src: "/images/gallery/tuxedo-portrait.jpg",
    caption: "Senior year",
    alt: "Ashton Carter in a tuxedo at a formal event",
    order: 2,
    published: true,
    addedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "img_3",
    src: "/images/gallery/family-group.jpg",
    caption: "With family, summer gathering",
    alt: "Ashton Carter with family members at a summer gathering",
    order: 3,
    published: true,
    addedAt: "2026-03-02T00:00:00Z",
  },
  {
    id: "img_4",
    src: "/images/gallery/family-friends.jpg",
    caption: "With friends at orientation",
    alt: "Ashton Carter with friends at college orientation",
    order: 4,
    published: true,
    addedAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "img_5",
    src: "/images/gallery/fraternity-brothers.jpg",
    caption: "With fraternity brothers",
    alt: "Ashton Carter with fraternity brothers",
    order: 5,
    published: true,
    addedAt: "2026-04-12T00:00:00Z",
  },
  {
    id: "img_6",
    src: "/images/gallery/award-ceremony.jpg",
    caption: "Graduation day, May 2019",
    alt: "Ashton Carter at his graduation award ceremony",
    order: 6,
    published: false,
    addedAt: "2026-08-28T19:47:00Z",
  },
]
