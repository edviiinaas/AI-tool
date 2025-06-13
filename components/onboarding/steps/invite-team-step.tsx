// FIX: Re-created this missing file
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"

interface InviteTeamStepProps {
  onComplete: () => void
}

export function InviteTeamStep({ onComplete }: InviteTeamStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-purple-100 text-purple-600 rounded-full p-3 mb-4">
        <Users className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Invite Your Team Members</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Construction is a team sport. Invite your colleagues to collaborate on projects.
      </p>
      <div className="w-full max-w-lg space-y-3 text-left">
        <Input type="email" placeholder="e.g., colleague@example.com" />
        <Input type="email" placeholder="e.g., manager@example.com" />
        <Button variant="outline" className="w-full">
          + Add another
        </Button>
      </div>
      <div className="mt-6 w-full max-w-lg flex flex-col sm:flex-row gap-3">
        <Button onClick={onComplete} variant="ghost" className="w-full">
          Skip for now
        </Button>
        <Button onClick={onComplete} className="w-full">
          Send Invites & Finish
        </Button>
      </div>
    </div>
  )
}
