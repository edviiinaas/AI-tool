"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PRICING_TIERS } from "@/lib/constants" // Re-use from landing page
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface UpgradePricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradePricingModal({ isOpen, onClose }: UpgradePricingModalProps) {
  // For simplicity, we'll reuse the PRICING_TIERS.
  // In a real app, this might have slightly different CTAs or info.
  const handleSelectPlan = (planName: string) => {
    alert(`Selected plan: ${planName}. Implement upgrade logic here.`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>Choose a plan that best fits your growing needs.</DialogDescription>
        </DialogHeader>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-lg border p-6 shadow-sm transition-all",
                tier.highlight ? "border-accent ring-2 ring-accent" : "",
              )}
            >
              <h3 className="text-xl font-semibold text-primary dark:text-primary-foreground/90">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.agentsIncluded}</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.priceSuffix && <span className="ml-1 text-sm text-muted-foreground">{tier.priceSuffix}</span>}
              </div>
              <ul className="mt-6 space-y-2 text-sm flex-grow">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSelectPlan(tier.name)}
                className={cn(
                  "mt-8 w-full",
                  tier.highlight
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground",
                )}
              >
                {tier.name === "Pro" ? "Current Plan" : `Switch to ${tier.name}`}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter className="p-6 pt-0">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
