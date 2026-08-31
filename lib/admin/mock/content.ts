// Mock data for AC7 Admin — Site Content (lightweight structured CMS)

export type ContentStatus = "Published" | "Draft"

export interface ContentPage {
  slug: string
  name: string
  status: ContentStatus
  lastUpdated: string
  updatedBy: string
  fields: { label: string; value: string; multiline?: boolean }[]
}

export const contentPages: ContentPage[] = [
  {
    slug: "home",
    name: "Home",
    status: "Published",
    lastUpdated: "2026-08-22T10:00:00Z",
    updatedBy: "Jordan Williams",
    fields: [
      { label: "Hero eyebrow", value: "In Loving Memory" },
      { label: "Hero title", value: "Ashton Carter" },
      {
        label: "Hero body",
        value:
          "Honoring his life and legacy through education, leadership, and community impact.",
        multiline: true,
      },
      { label: "Primary CTA label", value: "Support Our Mission" },
      { label: "Secondary CTA label", value: "His Story" },
      { label: "Featured image", value: "/images/ac7home.png" },
      { label: "Mission heading", value: "Continuing His Purpose" },
      {
        label: "Mission copy",
        value:
          "The AC7 Foundation exists to help young people reach their full potential the way Ashton did — with purpose, excellence, and heart.",
        multiline: true,
      },
    ],
  },
  {
    slug: "his-story",
    name: "His Story",
    status: "Published",
    lastUpdated: "2026-07-30T14:20:00Z",
    updatedBy: "Jordan Williams",
    fields: [
      { label: "Page title", value: "His Story" },
      {
        label: "Introduction",
        value:
          "Ashton Carter lived a life defined by purpose, excellence, and heart. This is his story, told by the people who loved him.",
        multiline: true,
      },
      { label: "Featured image", value: "/images/ashton-home.jpg" },
    ],
  },
  {
    slug: "foundation",
    name: "Foundation",
    status: "Published",
    lastUpdated: "2026-08-05T09:15:00Z",
    updatedBy: "Jordan Williams",
    fields: [
      {
        label: "Mission statement",
        value:
          "To honor Ashton Carter's legacy by empowering young people through education, mentorship, and leadership development.",
        multiline: true,
      },
      { label: "Program 1 title", value: "Scholarship Program" },
      {
        label: "Program 1 description",
        value: "Annual scholarships awarded to students demonstrating leadership and community service.",
        multiline: true,
      },
      { label: "Program 1 status", value: "Active" },
      { label: "Program 2 title", value: "Mentorship Circle" },
      {
        label: "Program 2 description",
        value: "Peer mentorship pairing young leaders with foundation volunteers.",
        multiline: true,
      },
      { label: "Program 2 status", value: "Launching Fall 2026" },
    ],
  },
  {
    slug: "donate",
    name: "Donate",
    status: "Published",
    lastUpdated: "2026-06-18T11:40:00Z",
    updatedBy: "Jordan Williams",
    fields: [
      { label: "Page title", value: "Support Our Mission" },
      {
        label: "Intro copy",
        value: "Every gift helps continue Ashton's legacy through scholarships and community programs.",
        multiline: true,
      },
      { label: "Suggested amounts", value: "25, 50, 100, 250" },
    ],
  },
  {
    slug: "contact",
    name: "Contact",
    status: "Draft",
    lastUpdated: "2026-08-31T08:00:00Z",
    updatedBy: "Jordan Williams",
    fields: [
      { label: "Page title", value: "Get in Touch" },
      { label: "Intro copy", value: "We'd love to hear from you.", multiline: true },
      { label: "Contact email", value: "Management@Ac7foundation.com" },
    ],
  },
]

export function getContentPage(slug: string) {
  return contentPages.find((p) => p.slug === slug)
}
