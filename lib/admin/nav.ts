import {
  LayoutDashboard,
  Inbox,
  HeartHandshake,
  Images,
  FileText,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Form Submissions", icon: Inbox },
  { href: "/admin/donations", label: "Donations", icon: HeartHandshake },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]
