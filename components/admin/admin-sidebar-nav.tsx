"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { adminNavItems } from "@/lib/admin/nav"
import { cn } from "@/lib/utils"

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {adminNavItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent/15 text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", isActive && "text-accent-foreground")} aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
