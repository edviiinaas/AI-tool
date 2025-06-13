"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { APP_LOGO, APP_NAME } from "@/lib/constants"
import { FcGoogle } from "react-icons/fc"
import { FaMicrosoft } from "react-icons/fa"
import { supabase } from "@/lib/supabase"
import { FaGithub, FaSlack } from "react-icons/fa"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const [magicEmail, setMagicEmail] = useState("")
  const [magicStatus, setMagicStatus] = useState<null | "sent" | "error" | "">(null)
  const [magicError, setMagicError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    const { error: authError } = await login(email, password)

    if (authError) {
      setError(authError.message)
    }
    // On success, the AuthContext's onAuthStateChange will handle the redirect.
  }

  // Social login handler
  const handleSocialLogin = async (provider: "google" | "azure" | "github" | "slack") => {
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) setError(error.message)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Magic link handler
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center mb-4 gap-2">
            <APP_LOGO className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{APP_NAME}</span>
          </Link>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Welcome Back!</CardTitle>
          <CardDescription>Log in to access your AI construction assistants.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-50 dark:bg-gray-800"
                />
                <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log In
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
              onClick={() => handleSocialLogin("google")}
            >
              <FcGoogle className="h-5 w-5" /> Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialLogin("azure")}
            >
              <FaMicrosoft className="h-5 w-5 text-[#2F2F2F]" /> Continue with Microsoft
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialLogin("github")}
            >
              <FaGithub className="h-5 w-5" /> Continue with GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialLogin("slack")}
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
            <Label htmlFor="magic-email">Sign in with magic link</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="your@email.com"
              value={magicEmail}
              onChange={e => setMagicEmail(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
              Send Magic Link
            </Button>
            {magicStatus === "sent" && <p className="text-xs text-green-600">Magic link sent! Check your email.</p>}
            {magicStatus === "error" && <p className="text-xs text-destructive">{magicError}</p>}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-primary">
            Forgot password?
          </Link>
          <p className="text-muted-foreground">
            {"Don't have an account?"}{" "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
