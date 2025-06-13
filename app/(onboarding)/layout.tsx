import type React from "react"
import { AuthProvider } from "@/contexts/auth-context" // Assuming onboarding might need auth context later
import { Toaster } from "@/components/ui/sonner"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex flex-col items-center justify-center p-4">
            {children}
          </main>
          <Toaster richColors />
        </body>
      </html>
    </AuthProvider>
  )
}
