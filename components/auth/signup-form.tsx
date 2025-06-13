"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { APP_LOGO, APP_NAME } from "@/lib/constants"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { SiMicrosoft } from "react-icons/si"
import { supabase } from "@/lib/supabase"
import { FaGithub, FaSlack } from "react-icons/fa"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [magicEmail, setMagicEmail] = useState("")
  const [magicStatus, setMagicStatus] = useState<null | "sent" | "error" | "">(null)
  const [magicError, setMagicError] = useState("")

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long."
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter."
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter."
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number."
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)."
    }
    return null
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    // Simple strength meter: 1 point for each rule
    let score = 0
    if (e.target.value.length >= 8) score++
    if (/[A-Z]/.test(e.target.value)) score++
    if (/[a-z]/.test(e.target.value)) score++
    if (/[0-9]/.test(e.target.value)) score++
    if (/[!@#$%^&*]/.test(e.target.value)) score++
    setPasswordStrength(score)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !fullName || !companyName || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await signup(email, password, fullName, companyName)
      if (error) {
        if (error.message.includes("already registered")) {
          setError("An account with this email already exists.")
        } else {
          setError(error.message || "Signup failed. Please try again.")
        }
        setIsSubmitting(false)
        return
      }
      // Redirect is handled by AuthContext
    } catch (err) {
      setError((err as Error).message || "Signup failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Social signup handler
  const handleSocialSignup = async (provider: "google" | "azure" | "github" | "slack") => {
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) setError(error.message)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Magic link signup handler
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicStatus(null)
    setMagicError("")
    if (!magicEmail) {
      setMagicError("Please enter your email.")
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: magicEmail })
      if (error) {
        setMagicStatus("error")
        setMagicError(error.message)
      } else {
        setMagicStatus("sent")
      }
    } catch (err) {
      setMagicStatus("error")
      setMagicError((err as Error).message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center mb-4">
            <APP_LOGO className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-primary dark:text-primary-foreground/90">{APP_NAME}</span>
          </Link>
          <CardTitle className="text-2xl text-primary dark:text-primary-foreground/90">Create an Account</CardTitle>
          <CardDescription>Join {APP_NAME} and empower your team with AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Your Company Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  disabled={isSubmitting}
                />
                <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded mt-1">
                <div className={`h-2 rounded ${passwordStrength <= 2 ? 'bg-red-400' : passwordStrength === 3 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${passwordStrength * 20}%` }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
          <div className="my-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-muted-foreground/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialSignup("google")}
            >
              <FcGoogle className="h-5 w-5" /> Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialSignup("azure")}
            >
              <SiMicrosoft className="h-5 w-5 text-[#2F2F2F]" /> Continue with Microsoft
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialSignup("github")}
            >
              <FaGithub className="h-5 w-5" /> Continue with GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialSignup("slack")}
            >
              <FaSlack className="h-5 w-5 text-[#611f69]" /> Continue with Slack
            </Button>
          </div>
          <div className="my-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-muted-foreground/20" />
          </div>
          <form onSubmit={handleMagicLink} className="space-y-2">
            <Label htmlFor="magic-email">Sign up with magic link</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="your@email.com"
              value={magicEmail}
              onChange={e => setMagicEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
              Send Magic Link
            </Button>
            {magicStatus === "sent" && <p className="text-xs text-green-600">Magic link sent! Check your email.</p>}
            {magicStatus === "error" && <p className="text-xs text-destructive">{magicError}</p>}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
