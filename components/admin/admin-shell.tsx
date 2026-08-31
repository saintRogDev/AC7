"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { adminNavItems } from "@/lib/admin/nav"
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav"
import { AdminUserMenu } from "@/components/admin/admin-user-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const currentLabel = adminNavItems.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  )?.label

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/admin" className="flex flex-col leading-tight">
            <span className="font-serif text-sm tracking-[0.2em] uppercase text-foreground">AC7 Foundation</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Staff Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminSidebarNav />
        </div>
        <div className="border-t border-border p-3">
          <AdminUserMenu />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:h-16 md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-medium text-foreground md:text-base">{currentLabel ?? "Admin"}</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Local demo data · not connected</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="font-serif text-sm tracking-[0.2em] uppercase">AC7 Foundation</SheetTitle>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Staff Admin</p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-3">
            <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="border-t border-border p-3">
            <AdminUserMenu />
          </div>
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-right" />
    </div>
  )
}
