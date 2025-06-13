"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Zap } from "lucide-react"
import { mockBillingData } from "@/lib/mock-data" // Assuming mockBillingData is here
import { useState } from "react"
import { UpgradePricingModal } from "./upgrade-pricing-modal" // We'll create this next

export function CurrentPlanCard() {
  const { currentPlan, nextBillingDate } = mockBillingData
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-primary dark:text-primary-foreground/90">Your Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing details.</CardDescription>
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
              <Zap className="mr-1.5 h-4 w-4" />
              Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {currentPlan.name} - {currentPlan.currency}
              {currentPlan.price}
              {currentPlan.term}
            </h3>
            <p className="text-sm text-muted-foreground">
              Next billing date: {new Date(nextBillingDate).toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-foreground">Plan Features:</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            Change Plan
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto">
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>
      <UpgradePricingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
