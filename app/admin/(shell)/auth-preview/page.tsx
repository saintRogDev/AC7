import { notFound } from "next/navigation"
import { AuthPreview } from "@/components/admin/auth/auth-preview"

export const metadata = { title: "Auth review | AC7 Foundation", robots: { index: false, follow: false } }

export default function AuthPreviewPage() {
  if (process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "development") notFound()
  return <AuthPreview />
}
