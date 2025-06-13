"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import type { AuthError, User as SupabaseUser } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isVerificationPending: boolean
  pendingUserEmail: string | null
  login: (email: string, pass: string) => Promise<{ error: AuthError | null }>
  signup: (email: string, pass: string, fullName?: string, companyName?: string) => Promise<{ error: AuthError | null }>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: AuthError | null }>
  updateUserMetadata: (metadata: Partial<User>) => Promise<{ error: AuthError | null }>
  verifyEmail: (code: string) => Promise<void>
  resendVerificationCode: () => Promise<void>
  getCurrentUser: () => User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerificationPending, setIsVerificationPending] = useState(false) // Mock state
  const [pendingUserEmail, setPendingUserEmail] = useState<string | null>(null) // Mock state
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      fullName: supabaseUser.user_metadata?.full_name,
      companyName: supabaseUser.user_metadata?.company_name,
      plan: supabaseUser.user_metadata?.plan || "starter",
      onboardingCompleted: supabaseUser.user_metadata?.onboarding_completed || false,
    }
  }

  useEffect(() => {
    setIsLoading(true)

    const handleRedirects = (sessionUser: SupabaseUser | null | undefined) => {
      const isAuthPage = pathname.startsWith("/auth/")
      const isAppPage = pathname.startsWith("/app/") || pathname === "/app" || pathname.startsWith("/onboarding")

      if (sessionUser) {
        // User is authenticated
        if (isAuthPage) {
          // If on /auth/login, /auth/signup etc.
          const onboardingCompleted = sessionUser.user_metadata?.onboarding_completed
          if (!onboardingCompleted) {
            router.push("/onboarding")
          } else {
            router.push("/app")
          }
        }
        // No redirect if on landing page ('/'), /app/*, or /onboarding/*
      } else {
        // User is not authenticated
        if (isAppPage) {
          // If trying to access protected /app or /onboarding routes
          router.push("/auth/login")
        }
        // No redirect if on landing page ('/') or auth pages
      }
    }

    // Check initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error)
          toast({ title: "Session Error", description: "Could not retrieve session.", variant: "destructive" })
        }
        const appUser = mapSupabaseUserToAppUser(session?.user || null)
        setUser(appUser)
        setIsLoading(false)
        handleRedirects(session?.user)
      })
      .catch((error) => {
        console.error("Error in getSession promise:", error)
        toast({ title: "Session Error", description: "Failed to initialize session.", variant: "destructive" })
        setIsLoading(false)
      })

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoading(true)
      const appUser = mapSupabaseUserToAppUser(session?.user || null)
      setUser(appUser)
      setIsLoading(false)
      handleRedirects(session?.user)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, pathname, toast])

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setIsLoading(false)
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Login Successful", description: "Welcome back!" })
      // Redirects are handled by onAuthStateChange via handleRedirects
    }
    return { error }
  }

  const signup = async (email: string, pass: string, fullName?: string, companyName?: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          plan: "starter",
          onboarding_completed: false,
        },
      },
    })
    setIsLoading(false)
    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" })
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast({
        title: "Signup Almost Complete!",
        description: "Please check your email to verify your account before logging in.",
      })
    } else {
      toast({ title: "Signup Successful!", description: "Please check your email to verify your account." })
      // Redirects to onboarding or app handled by onAuthStateChange via handleRedirects
    }
    return { error }
  }

  const logout = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    setIsLoading(false)
    if (error) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" })
    } else {
      setUser(null)
      toast({ title: "Logged Out", description: "You have been successfully logged out." })
      // Redirect to /auth/login is handled by onAuthStateChange via handleRedirects
      // Explicit push can be redundant but ensures immediate navigation if listener is slow
      if (pathname !== "/auth/login") router.push("/auth/login")
    }
  }

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true)
    const resetUrl = `${window.location.origin}/auth/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })
    setIsLoading(false)
    return { error } // Form will show toast
  }

  const updateUserMetadata = async (metadata: Partial<User>) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.updateUser({ data: metadata })
    setIsLoading(false)
    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" })
    } else if (data.user) {
      setUser(mapSupabaseUserToAppUser(data.user))
      toast({ title: "Profile Updated", description: "Your information has been saved." })
    }
    return { error }
  }

  // Mock verifyEmail and resendVerificationCode for now, as they were not fully implemented with Supabase
  const verifyEmail = async (code: string) => {
    setIsLoading(true)
    // This is a placeholder. Real Supabase email verification happens via a link.
    // If you have a custom OTP flow, implement it here.
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    console.warn("Mock verifyEmail called. Implement with Supabase if using custom OTP flow.")
    // For now, let's assume verification is successful for mock purposes
    // and redirect to onboarding. In a real scenario, Supabase handles this.
    // If user was pending, update their state and redirect.
    const tempUser = {
      email: pendingUserEmail || "test@example.com",
      id: "temp-id",
      onboardingCompleted: false,
      plan: "starter",
    } as User
    setUser(tempUser)
    localStorage.setItem("authUser_aic", JSON.stringify(tempUser)) // Mock persistence
    setIsVerificationPending(false)
    setPendingUserEmail(null)
    localStorage.removeItem("pendingUser_aic") // Mock cleanup
    setIsLoading(false)
    toast({ title: "Email Verified (Mock)", description: "Redirecting to onboarding." })
    router.push("/onboarding")
  }

  const resendVerificationCode = async () => {
    setIsLoading(true)
    // Placeholder for resending verification if using custom OTPs.
    // Supabase's default flow doesn't usually need this client-side.
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.warn("Mock resendVerificationCode called.")
    setIsLoading(false)
    toast({ title: "Verification Resent (Mock)", description: "A new code has been sent (mock)." })
  }

  const getCurrentUser = () => {
    return user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isVerificationPending,
        pendingUserEmail,
        login,
        signup,
        logout,
        requestPasswordReset,
        updateUserMetadata,
        verifyEmail,
        resendVerificationCode,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
