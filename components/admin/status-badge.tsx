import { cn } from "@/lib/utils"

// Central status color map for the admin. Any status string across
// submissions, donations, content, and staff can be passed here — colors
// are looked up by a normalized key so this stays a single source of truth.
const STATUS_STYLES: Record<string, string> = {
  new: "bg-accent/15 text-accent-foreground border-accent/30",
  reviewed: "bg-secondary text-secondary-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  failed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  refunded: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
  published: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  draft: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  invited: "bg-accent/15 text-accent-foreground border-accent/30",
  revoked: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[key] ?? "bg-secondary text-secondary-foreground border-border",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          key === "new" || key === "invited" ? "bg-accent" : "bg-current opacity-60",
        )}
      />
      {status}
    </span>
  )
}
