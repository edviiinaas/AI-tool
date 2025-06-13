import { CurrentPlanCard } from "@/components/app/billing/current-plan-card"
import { UsageMeters } from "@/components/app/billing/usage-meters"
import { InvoiceHistoryTable } from "@/components/app/billing/invoice-history-table"
import { PaymentMethods } from "@/components/app/billing/payment-methods"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Billing - AIConstruct",
}

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-primary-foreground/90">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">Manage your subscription, view invoices, and update payment methods.</p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <CurrentPlanCard />
          <InvoiceHistoryTable />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <UsageMeters />
          <PaymentMethods />
        </div>
      </div>
    </div>
  )
}
