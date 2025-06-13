"use client"

import { useState } from "react"
import { WelcomeStep } from "./steps/welcome-step"
import { AgentSelectionStep } from "./steps/agent-selection-step"
import { DocumentUploadStep } from "./steps/document-upload-step"
import { FirstMessageStep } from "./steps/first-message-step"
import { InviteTeamStep } from "./steps/invite-team-step"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const handleNext = () => {
    if (currentStep === 1 && !onboardingData.companyName.trim()) {
      alert("Please enter your company name to proceed."); // Replace with toast in a real app
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finish onboarding
      console.log("Onboarding complete:", onboardingData)
      // Here you would typically save onboarding status for the user
      // and update user's company name if it was collected.
      router.push("/app/dashboard") // Redirect to the main app dashboard
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

  const progressPercentage = (currentStep / totalSteps) * 100

  const stepTitles = [
    "Welcome to AIConstruct!",
    "Choose Your AI Assistants",
    "Upload Your First Document",
    "Send Your First Message",
    "Invite Your Team",
  ]

  return (
    <Card className="w-full max-w-2xl shadow-2xl">
      <CardHeader className="text-center">
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
        <CardTitle className="text-2xl font-semibold">{stepTitles[currentStep - 1]}</CardTitle>
        <Progress value={progressPercentage} className="mt-4 w-3/4 mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </CardHeader>
      <CardContent className="min-h-[300px] flex flex-col justify-center">
        {currentStep === 1 && <WelcomeStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 2 && <AgentSelectionStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 3 && <DocumentUploadStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 4 && <FirstMessageStep data={onboardingData} updateData={updateOnboardingData} />}
        {currentStep === 5 && <InviteTeamStep data={onboardingData} updateData={updateOnboardingData} />}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {currentStep === totalSteps ? "Finish Setup" : "Next Step"}
          {currentStep === totalSteps ? (
            <CheckCircle className="ml-2 h-4 w-4" />
          ) : (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
