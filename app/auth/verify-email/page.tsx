import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify Email - AIConstruct",
}

export default function VerifyEmailPage() {
  return <VerifyEmailForm />
}
