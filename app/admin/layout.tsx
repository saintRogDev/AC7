import Link from "next/link"
import { requireAc7Staff } from "@/lib/admin-auth"
import { SignOutButton } from "./sign-out-button"
export const dynamic = "force-dynamic"
/** AC7 foundation-admin presentation, with verified staff and live Events only. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireAc7Staff()
  return <div className="min-h-svh bg-background md:flex">
    <aside className="shrink-0 border-b border-border bg-card md:flex md:w-60 md:flex-col md:border-r">
      <Link href="/admin" className="flex h-16 flex-col justify-center border-b border-border px-4 leading-tight"><span className="font-serif text-sm uppercase tracking-[0.2em]">AC7 Foundation</span><span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Staff Admin</span></Link>
      <nav aria-label="Staff navigation" className="flex-1 p-4">{staff.role !== "reviewer" && <Link href="/admin/events" className="block rounded-md bg-muted p-3 font-medium">Events</Link>}{staff.role === "admin" && <Link href="/admin/staff" className="mt-3 block rounded-md p-3 font-medium">Staff invitations</Link>}<Link href="/" className="mt-3 block p-3 text-sm text-muted-foreground">Visit website</Link></nav>
      <div className="border-t border-border p-4"><p className="mb-2 truncate text-sm">{staff.email}</p><SignOutButton /></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8"><span>Staff administration</span><span className="rounded-full border px-3 py-1 text-sm">{staff.orgSlug === "ac7" ? "Production" : "Sandbox"} · {staff.role}</span></header><main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main></div>
  </div>
}
