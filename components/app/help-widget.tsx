"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { HelpDialog } from "./help-dialog"

export function HelpWidget() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  return (
    <>
      <Button
        variant="default"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setIsHelpOpen(true)}
      >
        <HelpCircle className="h-7 w-7" />
        <span className="sr-only">Open help menu</span>
      </Button>
      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </>
  )
}
