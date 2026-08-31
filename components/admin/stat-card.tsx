import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
    </div>
  )
}
