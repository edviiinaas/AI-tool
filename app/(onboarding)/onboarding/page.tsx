"use client"

import OnboardingWizard from "@/components/onboarding/onboarding-wizard"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const { user, isLoading, isVerificationPending } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isVerificationPending) {
        router.push("/auth/verify-email")
      } else if (!user) {
        router.push("/auth/login")
      }
      // If user exists and is not pending, they can proceed with onboarding
      // We might add a check here later to see if onboarding is already completed
    }
  }, [user, isLoading, isVerificationPending, router])

  if (isLoading || (!user && !isVerificationPending)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Only render wizard if user is authenticated and not pending verification
  if (user && !isVerificationPending) {
    return <OnboardingWizard />
  }

  return null // Or some other fallback if needed
}
