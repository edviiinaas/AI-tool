import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import Link from "next/link"
import { Briefcase } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - AIConstruct",
  description: "Reset your AIConstruct password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-semibold text-primary">
          <Briefcase className="h-7 w-7" />
          <span>AIConstruct</span>
        </Link>
      </div>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AIConstruct. All rights reserved.
      </p>
    </div>
  )
}
