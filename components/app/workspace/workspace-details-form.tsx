"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Building } from "lucide-react"

export function WorkspaceDetailsForm() {
  const { user, isLoading: authLoading, login } = useAuth() // Using login to 'refresh' user for mock
  const { toast } = useToast()

  const [workspaceName, setWorkspaceName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      // Assuming companyName from user object is the workspace name for now
      setWorkspaceName(user.companyName || "My Workspace")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !workspaceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Workspace name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock update user's companyName (which we're using as workspace name)
    const updatedUser = {
      ...user,
      companyName: workspaceName,
    }
    // This is a hack for mock. Ideally, AuthProvider would have an updateUser/updateWorkspace method.
    localStorage.setItem("authUser_aic", JSON.stringify(updatedUser))
    // Re-trigger a "login" like action to update the stored user and context.
    // This will also update the AppHeader if it's using user.companyName.
    await login(updatedUser.email, "")

    setIsSubmitting(false)
    toast({
      title: "Workspace Updated (Mock)",
      description: `Workspace name changed to "${workspaceName}".`,
    })
  }

  if (authLoading && !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>Manage your workspace settings.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Details</CardTitle>
        <CardDescription>
          Manage your workspace settings. The workspace name is displayed in the app header.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-md">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-grow space-y-1.5">
              <Label htmlFor="workspaceName">Workspace Name</Label>
              <Input
                id="workspaceName"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Your Workspace Name"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workspaceId">Workspace ID</Label>
            <Input id="workspaceId" value={user?.id || "N/A"} disabled readOnly />
            <p className="text-xs text-muted-foreground">This is your unique workspace identifier.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
