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
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import QRCode from "react-qr-code"

export function SecuritySettingsForm() {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [isTwoFactorSubmitting, setIsTwoFactorSubmitting] = useState(false)

  const [isTOTPEnrolling, setIsTOTPEnrolling] = useState(false)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState("")
  const [totpError, setTotpError] = useState("")

  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)

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

  // Start TOTP enrollment
  const handleStartTOTP = async () => {
    setIsTOTPEnrolling(true)
    setTotpError("")
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" })
      if (error) throw error
      setTotpSecret(data?.totp?.secret || null)
      setTotpUri(data?.totp?.uri || null)
      setFactorId(data?.id || null)
      setChallengeId(null)
    } catch (err: any) {
      setTotpError(err.message || "Failed to start 2FA setup.")
      setIsTOTPEnrolling(false)
    }
  }

  // Verify TOTP code
  const handleVerifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setTotpError("")
    try {
      if (!factorId) throw new Error("Missing factorId for verification.")
      // Step 1: Create challenge
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error
      const challengeId = challenge.data.id
      setChallengeId(challengeId)
      // Step 2: Verify
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: totpCode })
      if (error) throw error
      setIsTwoFactorEnabled(true)
      setIsTOTPEnrolling(false)
      setTotpSecret(null)
      setTotpUri(null)
      setTotpCode("")
      setFactorId(null)
      setChallengeId(null)
      toast({ title: "2FA Enabled", description: "Two-factor authentication is now active." })
    } catch (err: any) {
      setTotpError(err.message || "Invalid code. Please try again.")
    }
  }

  // Remove TOTP
  const handleRemoveTOTP = async () => {
    setIsTwoFactorSubmitting(true)
    setTotpError("")
    try {
      if (!factorId) throw new Error("Missing factorId for removal.")
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setIsTwoFactorEnabled(false)
      setFactorId(null)
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled." })
    } catch (err: any) {
      setTotpError(err.message || "Failed to disable 2FA.")
    } finally {
      setIsTwoFactorSubmitting(false)
    }
  }

  if (isPasswordSubmitting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password. Choose a strong, unique password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
        </CardContent>
      </Card>
    )
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={isPasswordSubmitting} className="ml-auto">
                    {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Change your password</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Switch
                      checked={isTwoFactorEnabled}
                      onCheckedChange={enabled => enabled ? handleStartTOTP() : handleRemoveTOTP()}
                      disabled={isTwoFactorSubmitting}
                      aria-label="Toggle Two-Factor Authentication"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Toggle Two-Factor Authentication</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {isTOTPEnrolling && totpUri && (
            <div className="mt-6 flex flex-col items-center">
              <p className="mb-2 text-sm">Scan this QR code with your authenticator app:</p>
              <QRCode value={totpUri} size={160} />
              <form onSubmit={handleVerifyTOTP} className="mt-4 flex flex-col items-center gap-2 w-full max-w-xs">
                <Label htmlFor="totp-code">Enter 6-digit code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  autoFocus
                />
                <Button type="submit" className="w-full mt-2">Verify & Enable 2FA</Button>
                {totpError && <p className="text-xs text-destructive mt-1">{totpError}</p>}
              </form>
            </div>
          )}
          {isTwoFactorEnabled && (
            <p className="text-sm text-muted-foreground mt-4">
              You will be asked for a verification code from your authenticator app when you sign in.
              <Button variant="link" className="ml-2 p-0 h-auto text-destructive" onClick={handleRemoveTOTP} disabled={isTwoFactorSubmitting}>Disable 2FA</Button>
            </p>
          )}
          {totpError && !isTOTPEnrolling && <p className="text-xs text-destructive mt-2">{totpError}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
