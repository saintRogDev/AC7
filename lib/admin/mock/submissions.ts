// Mock data for AC7 Admin — Form Submissions
// This file exists solely to demonstrate the admin UI. Replace with the
// reusable East Saint Labs Forms adapter when the real integration lands.

export type SubmissionType =
  | "Contact"
  | "Share a Memory"
  | "Photo Submission"
  | "Volunteer Interest"
  | "Scholarship Interest"

export type SubmissionStatus = "New" | "Reviewed" | "Archived"

export interface SubmissionAttachment {
  name: string
  type: "image" | "file"
  url: string
}

export interface SubmissionNote {
  author: string
  date: string
  note: string
}

export interface Submission {
  id: string
  type: SubmissionType
  status: SubmissionStatus
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  submittedAt: string
  attachments: SubmissionAttachment[]
  fields?: Record<string, string>
  permissionToPublish?: boolean
  notes: SubmissionNote[]
}

export const submissions: Submission[] = [
  {
    id: "sub_1001",
    type: "Share a Memory",
    status: "New",
    name: "Marcus Reid",
    email: "marcus.reid@example.com",
    phone: "(214) 555-0142",
    message:
      "Ashton and I met freshman year at orientation and became inseparable. He had this way of making everyone in a room feel like they mattered — I still hear his laugh when I'm having a rough day. This foundation is exactly what he would have wanted.",
    submittedAt: "2026-08-29T14:32:00Z",
    attachments: [{ name: "orientation-2015.jpg", type: "image", url: "/images/gallery/family-friends.jpg" }],
    fields: { "Relationship to Ashton": "College roommate" },
    permissionToPublish: true,
    notes: [],
  },
  {
    id: "sub_1002",
    type: "Contact",
    status: "New",
    name: "Priya Shah",
    email: "priya.shah@example.com",
    subject: "Partnership inquiry — Westlake High School",
    message:
      "Hello, I'm the guidance counselor at Westlake High School. We'd love to explore bringing the AC7 mentorship program to our juniors this spring. Could someone reach out to discuss scheduling and requirements?",
    submittedAt: "2026-08-29T09:05:00Z",
    attachments: [],
    notes: [],
  },
  {
    id: "sub_1003",
    type: "Photo Submission",
    status: "New",
    name: "Denise Carter",
    email: "denise.carter@example.com",
    message: "Found this while going through old boxes — thought the foundation might want it for the gallery.",
    submittedAt: "2026-08-28T19:47:00Z",
    attachments: [{ name: "ashton-graduation.jpg", type: "image", url: "/images/gallery/award-ceremony.jpg" }],
    fields: { Caption: "Graduation day, May 2019", Context: "Taken by his aunt outside the ceremony hall" },
    permissionToPublish: true,
    notes: [],
  },
  {
    id: "sub_1004",
    type: "Volunteer Interest",
    status: "Reviewed",
    name: "Jalen Ford",
    email: "jalen.ford@example.com",
    phone: "(469) 555-0187",
    message:
      "I'd like to help out with the annual scholarship gala — I have experience with event coordination and would love to be involved however is most useful.",
    submittedAt: "2026-08-27T11:20:00Z",
    attachments: [],
    fields: { "Areas of interest": "Event planning, Fundraising" },
    notes: [{ author: "Jordan Williams", date: "2026-08-27T16:00:00Z", note: "Added to volunteer roster for the gala committee." }],
  },
  {
    id: "sub_1005",
    type: "Scholarship Interest",
    status: "Reviewed",
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    message:
      "I'm a junior at Lincoln High interested in the scholarship program once applications open. What are the eligibility requirements?",
    submittedAt: "2026-08-25T08:12:00Z",
    attachments: [],
    notes: [{ author: "Jordan Williams", date: "2026-08-25T13:00:00Z", note: "Replied with program timeline; applications open in spring." }],
  },
  {
    id: "sub_1006",
    type: "Contact",
    status: "Archived",
    name: "Tom Bradley",
    email: "tom.bradley@example.com",
    subject: "Media request",
    message: "Writing a piece for the community paper — would appreciate a quote from the foundation.",
    submittedAt: "2026-08-20T15:44:00Z",
    attachments: [],
    notes: [{ author: "Jordan Williams", date: "2026-08-21T09:00:00Z", note: "Declined — outside current media policy. Archived." }],
  },
  {
    id: "sub_1007",
    type: "Share a Memory",
    status: "Archived",
    name: "Keisha Brooks",
    email: "keisha.brooks@example.com",
    message: "Duplicate submission — resubmitted with corrected email address.",
    submittedAt: "2026-08-18T10:03:00Z",
    attachments: [],
    fields: { "Relationship to Ashton": "Cousin" },
    permissionToPublish: false,
    notes: [{ author: "Jordan Williams", date: "2026-08-18T10:30:00Z", note: "Duplicate of sub_1008. Archived this one." }],
  },
  {
    id: "sub_1008",
    type: "Volunteer Interest",
    status: "New",
    name: "Elijah Moore",
    email: "elijah.moore@example.com",
    phone: "(972) 555-0119",
    message: "Interested in mentoring — I went through a similar program growing up and want to give back.",
    submittedAt: "2026-08-30T07:58:00Z",
    attachments: [],
    fields: { "Areas of interest": "Mentorship" },
    notes: [],
  },
]

export function getSubmissionById(id: string) {
  return submissions.find((s) => s.id === id)
}
