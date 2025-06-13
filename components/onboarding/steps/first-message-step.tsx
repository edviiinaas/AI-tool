// FIX: Re-created this missing file
"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

interface FirstMessageStepProps {
  onComplete: () => void
}

export function FirstMessageStep({ onComplete }: FirstMessageStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-orange-100 text-orange-600 rounded-full p-3 mb-4">
        <MessageSquare className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Try Sending Your First Message</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Ask a question about the document you uploaded, or just say hello to see how the AI responds.
      </p>
      <div className="w-full max-w-lg text-left">
        <Textarea
          placeholder="e.g., 'Summarize the key requirements in this tender document.'"
          className="mb-4 h-24"
          defaultValue="Summarize the key requirements in the uploaded tender document."
        />
        <Button onClick={onComplete} className="w-full bg-orange-500 hover:bg-orange-600">
          Send Message & Continue
        </Button>
      </div>
    </div>
  )
}
