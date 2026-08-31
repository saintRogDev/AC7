"use client"

import { useState } from "react"
import { Info, Lock } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState("Management@Ac7foundation.com")

  function handleSave() {
    toast.success("Settings saved", { description: "This is a demo — settings aren't persisted." })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <AdminPageHeader
        title="Settings"
        description="Client-level settings for the AC7 Foundation site."
        actions={<Button size="sm" onClick={handleSave}>Save Changes</Button>}
      />

      <SettingsSection title="Organization" description="Public-facing details about the foundation.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-name">Foundation display name</Label>
            <Input id="org-name" defaultValue="AC7 Foundation" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-email">Public contact email</Label>
            <Input id="org-email" type="email" defaultValue="Management@Ac7foundation.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-phone">Public phone (optional)</Label>
            <Input id="org-phone" type="tel" placeholder="(555) 555-5555" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="org-address">Mailing address</Label>
            <Textarea id="org-address" rows={2} placeholder="123 Legacy Way, Dallas, TX 75201" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Form Notifications">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notify-email">Form submission notification email</Label>
          <Input
            id="notify-email"
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
          />
        </div>
        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            New public form submissions will be sent to this email address and will also remain available in{" "}
            <span className="font-medium text-foreground">Form Submissions</span>.
          </span>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Donation Settings"
        description="Payment processing configuration is managed by Stripe and isn't editable here."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Payment processor</Label>
            <Input disabled value="Stripe" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5">
              <Lock className="size-3" />
              Secret key
            </Label>
            <Input disabled value="•••••••••••••••••••••" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Site Preferences">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sender-name">Default sender name</Label>
            <Input id="sender-name" defaultValue="AC7 Foundation" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notify-pref">Notification preference</Label>
            <Input id="notify-pref" defaultValue="Email me for every new submission" />
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
