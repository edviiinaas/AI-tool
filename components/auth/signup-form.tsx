"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { APP_LOGO, APP_NAME } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signup } = useAuth()

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
      await signup(email, fullName, companyName)
      // Redirect is handled by AuthContext
    } catch (err) {
      setError((err as Error).message || "Signup failed. Please try again.")
      setIsSubmitting(false)
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
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
