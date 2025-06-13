"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function SecuritySettingsForm() {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false) // Mock state
  const [isTwoFactorSubmitting, setIsTwoFactorSubmitting] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }

    setIsPasswordSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsPasswordSubmitting(false)

    // Mock success/error
    if (currentPassword === "password123") {
      // Mock: old password check
      toast({
        title: "Password Changed (Mock)",
        description: "Your password has been successfully updated.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setPasswordError("Incorrect current password. (Hint: try 'password123')")
      toast({
        title: "Password Change Failed (Mock)",
        description: "Incorrect current password.",
        variant: "destructive",
      })
    }
  }

  const handleToggleTwoFactor = async (enabled: boolean) => {
    setIsTwoFactorSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsTwoFactorEnabled(enabled)
    setIsTwoFactorSubmitting(false)
    toast({
      title: `Two-Factor Authentication ${enabled ? "Enabled" : "Disabled"} (Mock)`,
      description: `2FA has been ${enabled ? "activated" : "deactivated"}.`,
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password. Choose a strong, unique password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isPasswordSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPasswordSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPasswordSubmitting}
              />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isPasswordSubmitting} className="ml-auto">
              {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background dark:bg-muted/30">
            <div className="flex items-center">
              {isTwoFactorEnabled ? (
                <ShieldCheck className="h-6 w-6 mr-3 text-green-500" />
              ) : (
                <ShieldOff className="h-6 w-6 mr-3 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Status: {isTwoFactorEnabled ? "Enabled" : "Not Enabled"}</p>
                <p className="text-sm text-muted-foreground">
                  {isTwoFactorEnabled ? "Your account is protected with 2FA." : "Enable 2FA for enhanced security."}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {isTwoFactorSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Switch
                checked={isTwoFactorEnabled}
                onCheckedChange={handleToggleTwoFactor}
                disabled={isTwoFactorSubmitting}
                aria-label="Toggle Two-Factor Authentication"
              />
            </div>
          </div>
          {isTwoFactorEnabled && (
            <p className="text-sm text-muted-foreground mt-4">
              You will be asked for a verification code from your authenticator app when you sign in.
              {/* In a real app, show recovery codes option or manage devices here */}
            </p>
          )}
        </CardContent>
        {!isTwoFactorEnabled && (
          <CardFooter className="border-t pt-6">
            <Button onClick={() => handleToggleTwoFactor(true)} disabled={isTwoFactorSubmitting} variant="outline">
              {isTwoFactorSubmitting && isTwoFactorEnabled === false ? ( // Check if trying to enable
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Setup Two-Factor Authentication
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
