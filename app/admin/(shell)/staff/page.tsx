"use client"

import { useState } from "react"
import { MoreHorizontal, UserPlus, Users, Mail, ShieldOff, RotateCcw } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"
import { StatusBadge } from "@/components/admin/status-badge"
import { InviteStaffDialog } from "@/components/admin/invite-staff-dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { staffMembers as initialStaff, type StaffMember, type StaffRole } from "@/lib/admin/mock/staff"
import { formatDateTime } from "@/lib/admin/format"
import { toast } from "sonner"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [inviteOpen, setInviteOpen] = useState(false)

  function handleInvite(values: { name: string; email: string; role: StaffRole }) {
    setStaff((prev) => [
      ...prev,
      {
        id: `staff_${Date.now()}`,
        name: values.name,
        email: values.email,
        role: values.role,
        status: "Invited",
        lastActive: null,
        invitedAt: new Date().toISOString(),
      },
    ])
    toast.success(`Invitation sent to ${values.email}`)
  }

  function changeRole(id: string, role: StaffRole) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)))
    toast.success("Role updated")
  }

  function revokeAccess(id: string) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Revoked" } : s)))
    toast.success("Access revoked")
  }

  function resendInvite(email: string) {
    toast.success(`Invitation resent to ${email}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Staff"
        description="Manage who has access to the AC7 Foundation admin and what they can do."
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" />
            Invite Staff
          </Button>
        }
      />

      {staff.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="No staff members yet"
          description="Invite your first team member to give them access to the admin."
          action={
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" />
              Invite Staff
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 border border-border">
                        <AvatarFallback className="bg-accent/15 text-[11px] font-semibold text-accent-foreground">
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-muted-foreground">{member.role}</TableCell>
                  <TableCell>
                    <StatusBadge status={member.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.lastActive ? formatDateTime(member.lastActive) : "Never signed in"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change role</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={member.role === "Admin"}
                          onClick={() => changeRole(member.id, "Admin")}
                        >
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={member.role === "Manager"}
                          onClick={() => changeRole(member.id, "Manager")}
                        >
                          Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {member.status === "Invited" && (
                          <DropdownMenuItem onClick={() => resendInvite(member.email)}>
                            <Mail className="size-4" />
                            Resend Invite
                          </DropdownMenuItem>
                        )}
                        {member.status !== "Revoked" ? (
                          <DropdownMenuItem variant="destructive" onClick={() => revokeAccess(member.id)}>
                            <ShieldOff className="size-4" />
                            Revoke Access
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setStaff((prev) => prev.map((s) => (s.id === member.id ? { ...s, status: "Active" } : s)))
                              toast.success("Access restored")
                            }}
                          >
                            <RotateCcw className="size-4" />
                            Restore Access
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InviteStaffDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
    </div>
  )
}
