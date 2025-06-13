"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { APP_NAME } from "@/lib/constants"

interface StepProps {
  data: { companyName: string }
  updateData: (data: { companyName: string }) => void
}

export function WelcomeStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-medium">Let's get your workspace ready in {APP_NAME}.</h2>
      <p className="text-muted-foreground">
        To start, please tell us the name of your company or organization. This will help personalize your experience.
      </p>
      <div className="max-w-sm mx-auto text-left">
        <Label htmlFor="companyName" className="text-sm font-medium">
          Company Name
        </Label>
        <Input
          id="companyName"
          type="text"
          placeholder="E.g., BuildWell Construction"
          value={data.companyName}
          onChange={(e) => updateData({ companyName: e.target.value })}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">You can change this later in your workspace settings.</p>
      </div>
    </div>
  )
}
