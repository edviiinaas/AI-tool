"use client"

import { useState } from "react"
import { TeamMembersTable } from "@/components/app/team/team-members-table"
import { InviteMemberModal } from "@/components/app/team/invite-member-modal"
import { PendingInvitationsTable } from "@/components/app/team/pending-invitations-table"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function TeamPageClient() {
  const [newlyInvited, setNewlyInvited] = useState<{ email: string; role: string } | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const handleInviteSent = (email: string, role: string) => {
    setNewlyInvited({ email, role })
    setIsInviteModalOpen(false) // Close modal on success
  }

  const handleClearNewInvitation = () => {
    setNewlyInvited(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-primary-foreground/90">
          Team Management
        </h1>
        <p className="text-muted-foreground">Manage your team members, roles, and pending invitations.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">Team Members</CardTitle>
            <CardDescription>View and manage current members of your team.</CardDescription>
          </div>
          <InviteMemberModal
            onInviteSent={handleInviteSent}
            isOpen={isInviteModalOpen}
            onOpenChange={setIsInviteModalOpen}
          />
        </CardHeader>
        <CardContent>
          <TeamMembersTable onInviteClick={() => setIsInviteModalOpen(true)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pending Invitations</CardTitle>
          <CardDescription>Track invitations that have been sent but not yet accepted.</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingInvitationsTable newInvitation={newlyInvited} onClearNewInvitation={handleClearNewInvitation} />
        </CardContent>
      </Card>
    </div>
  )
}
