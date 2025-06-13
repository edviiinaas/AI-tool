"use client"

import { useState } from "react"
import WelcomeStep from "./steps/welcome-step"
import { AgentSelectionStep } from "./steps/agent-selection-step"
import { DocumentUploadStep } from "./steps/document-upload-step"
import { FirstMessageStep } from "./steps/first-message-step"
import { InviteTeamStep } from "./steps/invite-team-step"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useNotificationSystem } from "@/contexts/notification-settings-context"

const totalSteps = 5

interface OnboardingData {
  companyName: string
  selectedAgentIds: string[]
  uploadedDocumentName: string | null
  firstMessageSent: boolean
  teamInvitesSent: number
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: "",
    selectedAgentIds: [],
    uploadedDocumentName: null,
    firstMessageSent: false,
    teamInvitesSent: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { addNotification } = useNotificationSystem()

  const handleNext = async () => {
    if (currentStep === 1 && !onboardingData.companyName.trim()) {
      toast({ title: "Missing Company Name", description: "Please enter your company name to proceed.", variant: "destructive" })
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finish onboarding
      setIsSubmitting(true)
      try {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true, company_name: onboardingData.companyName }
        })
        addNotification({
          title: "Onboarding Complete!",
          description: "You have successfully completed onboarding. Welcome to AIConstruct!",
          eventType: "newFeature",
          href: "/app/dashboard"
        })
        router.push("/app/dashboard")
      } catch (error) {
        toast({ title: "Onboarding Failed", description: "Could not complete onboarding. Please try again.", variant: "destructive" })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }))
  }

  const handleFirstMessageComplete = () => {
    updateOnboardingData({ firstMessageSent: true })
    handleNext()
  }

  const handleTeamInviteComplete = () => {
    updateOnboardingData({ teamInvitesSent: onboardingData.teamInvitesSent + 1 })
    handleNext()
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  const stepTitles = [
    "Welcome to AIConstruct!",
    "Choose Your AI Assistants",
    "Upload Your First Document",
    "Send Your First Message",
    "Invite Your Team",
  ]

  return (
    <Card className="w-full max-w-2xl shadow-2xl mx-auto px-1 sm:px-4">
      <CardHeader className="text-center pb-2 pt-4 sm:pt-8">
        <div className="mx-auto mb-4 text-primary">
          {/* Placeholder for a logo or icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <CardTitle className="text-lg sm:text-2xl font-semibold">{stepTitles[currentStep - 1]}</CardTitle>
        <Progress value={progressPercentage} className="mt-4 w-full sm:w-3/4 mx-auto" />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </CardHeader>
      <CardContent className="min-h-[220px] sm:min-h-[300px] flex flex-col justify-center px-1 sm:px-6">
        {currentStep === 1 && <WelcomeStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 2 && <AgentSelectionStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 3 && <DocumentUploadStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 4 && <FirstMessageStep onComplete={handleFirstMessageComplete} />}
        {currentStep === 5 && <InviteTeamStep onComplete={handleTeamInviteComplete} />}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-4 gap-2 sm:gap-0">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="ghost" onClick={() => router.push('/app/dashboard')} disabled={isSubmitting} className="w-full sm:w-auto">
            Skip
          </Button>
          <Button onClick={handleNext} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center"><svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Processing...</span>
            ) : currentStep === totalSteps ? (
              <>Finish Setup<CheckCircle className="ml-2 h-4 w-4" /></>
            ) : (
              <>Next Step<ChevronRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
