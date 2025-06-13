"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, PlusCircle, Edit3, Trash2 } from "lucide-react"
import { mockBillingData } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export function PaymentMethods() {
  const { paymentMethods } = mockBillingData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary dark:text-primary-foreground/90">Payment Methods</CardTitle>
        <CardDescription>Manage your saved payment methods.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-md border p-4 bg-background dark:bg-muted/30"
            >
              <div className="flex items-center">
                <CreditCard className="mr-3 h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {method.type} ending in {method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                </div>
                {method.isPrimary && (
                  <Badge variant="secondary" className="ml-3">
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Edit payment method">
                  <Edit3 className="h-4 w-4" />
                </Button>
                {!method.isPrimary && (
                  <Button variant="ghost" size="icon" className="text-destructive" aria-label="Remove payment method">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No payment methods saved.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Payment Method
        </Button>
      </CardFooter>
    </Card>
  )
}
