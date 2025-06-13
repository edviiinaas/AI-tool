"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Loader2, MailCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export function VerifyEmailForm() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const {
    verifyEmail,
    pendingUserEmail,
    isVerificationPending,
    isLoading: authIsLoading,
    resendVerificationCode,
  } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authIsLoading && !isVerificationPending && !pendingUserEmail) {
      // If no pending verification, redirect away
      router.replace("/auth/signup")
    }
  }, [authIsLoading, isVerificationPending, pendingUserEmail, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else {
      setResendDisabled(false)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleResendCode = async () => {
    setError("")
    setResendDisabled(true)
    setCountdown(60) // Disable for 60 seconds
    try {
      await resendVerificationCode()
      // Show toast: "Verification code resent"
    } catch (err) {
      setError((err as Error).message || "Failed to resend code. Please try again.")
      setResendDisabled(false) // Re-enable immediately on error
      setCountdown(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit verification code.")
      return
    }
    setIsSubmitting(true)
    try {
      await verifyEmail(code)
      // Redirect is handled by AuthContext
    } catch (err) {
      setError((err as Error).message || "Verification failed. Please check the code and try again.")
      setIsSubmitting(false)
    }
  }

  if (authIsLoading && !pendingUserEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary dark:text-primary-foreground/90">Verify Your Email</CardTitle>
          <CardDescription>
            {`We've sent a 6-digit verification code to`} <br />
            <span className="font-semibold">{pendingUserEmail || "your email address"}</span>.
            {` Please enter it below.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                disabled={isSubmitting}
                className="text-center tracking-[0.3em] text-lg h-12"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          <Button
            variant="link"
            onClick={handleResendCode}
            disabled={resendDisabled || isSubmitting}
            className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
          >
            {`Didn't receive the code? ${resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}`}
          </Button>
          <p className="text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link href="/auth/signup" className="font-semibold text-accent hover:underline">
              Sign up again
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
