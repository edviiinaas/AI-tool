"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { Steps } from "intro.js-react"
import "intro.js/minified/introjs.min.css"
import { Progress } from "@/components/ui/progress"

interface ProductTourContextType {
  startTour: () => void
  currentStep: number
  totalSteps: number
  progress: number
}

const ProductTourContext = createContext<ProductTourContextType | undefined>(undefined)

export function useProductTour() {
  const context = useContext(ProductTourContext)
  if (!context) {
    throw new Error("useProductTour must be used within a ProductTourProvider")
  }
  return context
}

export function ProductTourProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 8 // Total number of steps in the tour
  const progress = (currentStep / totalSteps) * 100

  const startTour = useCallback(() => {
    setCurrentStep(1) // Start from step 1
  }, [])

  const steps = [
    {
      element: '[data-tour="dashboard"]',
      intro: "Welcome to your dashboard! Here you'll find an overview of your workspace activity.",
      position: "bottom",
    },
    {
      element: '[data-tour="sidebar"]',
      intro: "Use the sidebar to navigate between different sections of the app.",
      position: "right",
    },
    {
      element: '[data-tour="notifications"]',
      intro: "Stay updated with real-time notifications about your workspace.",
      position: "bottom",
    },
    {
      element: '[data-tour="profile-settings"]',
      intro: "Manage your profile settings and preferences here.",
      position: "left",
    },
    {
      element: '[data-tour="team"]',
      intro: "Invite and manage your team members in one place.",
      position: "bottom",
    },
    {
      element: '[data-tour="knowledge"]',
      intro: "Access and manage your knowledge base documents.",
      position: "bottom",
    },
    {
      element: '[data-tour="chat"]',
      intro: "Chat with your team and AI assistants in real-time.",
      position: "left",
    },
    {
      element: '[data-tour="help"]',
      intro: "Need help? Click here to access support and documentation.",
      position: "left",
    },
  ]

  return (
    <ProductTourContext.Provider value={{ startTour, currentStep, totalSteps, progress }}>
      {children}
      <Steps
        enabled={currentStep > 0}
        steps={steps}
        initialStep={currentStep - 1}
        onExit={() => setCurrentStep(0)}
        onBeforeChange={(nextStepIndex) => {
          setCurrentStep(nextStepIndex + 1)
        }}
        options={{
          showProgress: true,
          showBullets: true,
          exitOnOverlayClick: false,
          exitOnEsc: false,
          nextLabel: "Next →",
          prevLabel: "← Back",
          skipLabel: "Skip Tour",
          doneLabel: "Got it!",
          tooltipClass: "custom-tour-tooltip",
          scrollToElement: true,
          overlayOpacity: 0.5,
        }}
      />
      {currentStep > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <button
              onClick={() => setCurrentStep(0)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </button>
          </div>
          <Progress value={progress} className="w-[200px]" />
        </div>
      )}
    </ProductTourContext.Provider>
  )
} 