"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockBillingData } from "@/lib/mock-data"
import { MessageSquare, HardDrive, Users, FolderKanban } from "lucide-react"

interface UsageItemProps {
  icon: React.ElementType
  label: string
  current: number
  limit: number | string
  unit: string
}

function UsageItem({ icon: Icon, label, current, limit, unit }: UsageItemProps) {
  const percentage = typeof limit === "number" ? (current / limit) * 100 : 0
  const isUnlimited = typeof limit === "string" && limit.toLowerCase() === "unlimited"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-muted-foreground">
          <Icon className="mr-2 h-4 w-4" />
          <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">
          {current.toLocaleString()}{" "}
          {isUnlimited ? "" : `/ ${typeof limit === "number" ? limit.toLocaleString() : limit}`} {unit}
        </span>
      </div>
      {!isUnlimited && typeof limit === "number" && <Progress value={percentage} aria-label={`${label} usage`} />}
      {isUnlimited && (
        <div className="h-2 w-full rounded-full bg-green-200 dark:bg-green-700" title="Unlimited Usage"></div>
      )}
    </div>
  )
}

export function UsageMeters() {
  const { usage } = mockBillingData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary dark:text-primary-foreground/90">Usage This Cycle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageItem
          icon={MessageSquare}
          label="Messages Sent"
          current={usage.messages.current}
          limit={usage.messages.limit}
          unit={usage.messages.unit}
        />
        <UsageItem
          icon={HardDrive}
          label="Storage Used"
          current={usage.storage.current}
          limit={usage.storage.limit}
          unit={usage.storage.unit}
        />
        <UsageItem
          icon={FolderKanban}
          label="Projects Created"
          current={usage.projects.current}
          limit={usage.projects.limit}
          unit={usage.projects.unit}
        />
        <UsageItem
          icon={Users}
          label="Team Seats"
          current={usage.teamSeats.current}
          limit={usage.teamSeats.limit}
          unit={usage.teamSeats.unit}
        />
      </CardContent>
    </Card>
  )
}
