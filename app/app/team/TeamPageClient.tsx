"use client"

import { useState, useEffect } from "react"
import { TeamMembersTable } from "@/components/app/team/team-members-table"
import { InviteMemberModal } from "@/components/app/team/invite-member-modal"
import { PendingInvitationsTable } from "@/components/app/team/pending-invitations-table"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useNotificationSystem } from "@/contexts/notification-settings-context"

export default function TeamPageClient() {
  const { user } = useAuth()
  const { addNotification } = useNotificationSystem()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [newlyInvited, setNewlyInvited] = useState<{ email: string; role: string } | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    // Fetch team members
    supabase.from("users").select("*")
      .then(({ data }) => setTeamMembers(data || []))
    // Fetch pending invitations
    supabase.from("invitations").select("*")
      .then(({ data }) => setPendingInvitations(data || []))
  }, [user])

  if (!user) {
    return <div>Loading team data...</div>
  }

  const handleInviteSent = (email: string, role: string) => {
    setNewlyInvited({ email, role })
    setIsInviteModalOpen(false)
    addNotification({
      title: "Team Invite Sent",
      description: `Invitation sent to ${email} as ${role}.`,
      eventType: "teamInviteAccepted",
      href: "/app/team"
    })
    // Optionally refetch team members/invitations
  }

  const handleClearNewInvitation = () => {
    setNewlyInvited(null)
  }

  return (
    <div data-tour="team" className="space-y-8">
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
          <TeamMembersTable teamMembers={teamMembers} onInviteClick={() => setIsInviteModalOpen(true)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pending Invitations</CardTitle>
          <CardDescription>Track invitations that have been sent but not yet accepted.</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingInvitationsTable invitations={pendingInvitations} newInvitation={newlyInvited} onClearNewInvitation={handleClearNewInvitation} />
        </CardContent>
      </Card>
    </div>
  )
}
