import { redirect } from "next/navigation"
import { requireAc7Staff } from "@/lib/admin-auth"
export default async function AdminPage() { const staff = await requireAc7Staff(); if (staff.role === "reviewer") return <p>Your staff role does not include Events access.</p>; redirect("/admin/events") }
