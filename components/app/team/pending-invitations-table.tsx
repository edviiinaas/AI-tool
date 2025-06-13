"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Mail, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

type Invitation = {
  id: string
  email: string
  role: string
  invitedAt: string
  // Add other fields as needed from your Supabase invitations table
}

interface PendingInvitationsTableProps {
  invitations: Invitation[]
  newInvitation: { email: string; role: string } | null
  onClearNewInvitation: () => void
  isLoading?: boolean
}

export function PendingInvitationsTable({ invitations, newInvitation, onClearNewInvitation, isLoading = false }: PendingInvitationsTableProps) {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<Invitation | null>(null)

  useEffect(() => {
    if (newInvitation) {
      // Optionally, you could trigger a refetch or update parent state here
      onClearNewInvitation()
    }
  }, [newInvitation, onClearNewInvitation])

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>A list of pending invitations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length > 0 ? (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invitation.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(invitation.invitedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => setShowRemoveConfirm(invitation)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke Invitation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Mail className="h-12 w-12 text-muted-foreground/40" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">No pending invitations</h3>
                      <p className="text-muted-foreground">Invitations you send will appear here.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Remove Invitation Confirmation Dialog */}
      <Dialog open={!!showRemoveConfirm} onOpenChange={() => setShowRemoveConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke invitation for {showRemoveConfirm?.email}?</DialogTitle>
            <DialogDescription>
              This will invalidate the invitation link. They will not be able to join the team unless you invite them
              again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => setShowRemoveConfirm(null)}
            >
              Revoke Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
