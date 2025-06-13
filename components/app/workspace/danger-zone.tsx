"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context" // To simulate logout on delete

export function DangerZone() {
  const { toast } = useToast()
  const { logout, user } = useAuth() // Use logout for mock deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")

  const workspaceNameToConfirm = user?.companyName || "My Workspace" // Use current workspace name

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmationText !== workspaceNameToConfirm) {
      toast({
        title: "Confirmation Failed",
        description: "The entered workspace name does not match. Deletion cancelled.",
        variant: "destructive",
      })
      return
    }

    // Simulate API call for deletion
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Workspace Deleted (Mock)",
      description: "Your workspace and all its data have been (mock) deleted. You will be logged out.",
    })
    setShowDeleteConfirm(false)
    setDeleteConfirmationText("")
    // Simulate logout and redirect
    logout()
  }

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-destructive/50 rounded-lg bg-destructive/5">
            <div>
              <h4 className="font-semibold text-destructive">Delete this Workspace</h4>
              <p className="text-sm text-muted-foreground">
                Permanently remove your workspace, including all projects, chats, and team members.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-3 sm:mt-0 sm:ml-4 shrink-0"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Workspace Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirm Workspace Deletion
            </DialogTitle>
            <DialogDescription>
              This action is irreversible. All data associated with the workspace "{workspaceNameToConfirm}" will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                You are about to delete your entire workspace. This includes all chats, documents, team members, and
                settings.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="deleteConfirmText" className="font-medium">
                To confirm, please type the workspace name:{" "}
                <strong className="text-foreground">{workspaceNameToConfirm}</strong>
              </Label>
              <Input
                id="deleteConfirmText"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={workspaceNameToConfirm}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setDeleteConfirmationText("")}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={deleteConfirmationText !== workspaceNameToConfirm}
            >
              <Trash2 className="mr-2 h-4 w-4" />I understand, delete this workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
