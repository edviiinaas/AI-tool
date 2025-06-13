"use client"

import { useNotificationSystem } from "@/contexts/notification-settings-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { AppNotification } from "@/lib/types"
import { CheckCircle, Circle, Mail, Bell, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

const EVENT_TYPE_LABELS: Record<string, string> = {
  agentResponse: "Agent Response",
  docAnalysisComplete: "Document Analysis",
  teamInviteAccepted: "Team",
  billingSuccess: "Billing",
  newFeature: "Feature",
  taskMention: "Task",
}

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  agentResponse: Bell,
  docAnalysisComplete: Mail,
  teamInviteAccepted: CheckCircle,
  billingSuccess: CheckCircle,
  newFeature: Bell,
  taskMention: Mail,
}

function NotificationSkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 rounded-md border p-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    clearAll,
  } = useNotificationSystem()
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [isLoading, setIsLoading] = useState(false) // Simulate loading if needed

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    if (filter === "read") return n.read
    return true
  })

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle>Notifications</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button size="sm" variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0 || notifications.length === 0}>
                      Mark all as read
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Mark all notifications as read</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button size="sm" variant="ghost" onClick={clearAll} disabled={notifications.length === 0}>
                      Clear all
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Delete all notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread {unreadCount > 0 && <Badge className="ml-1" variant="secondary">{unreadCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <NotificationSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Image
                  src="/placeholder.svg?width=128&height=128"
                  width={128}
                  height={128}
                  alt="No notifications illustration"
                  className="opacity-60"
                />
                <h3 className="text-lg font-semibold text-foreground">No Notifications</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  You have no notifications yet. Important updates, invites, and alerts will show up here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredNotifications.map((n: AppNotification) => {
                  const Icon = n.icon || EVENT_TYPE_ICONS[n.eventType] || Bell
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 rounded-md border p-4 transition-colors cursor-pointer hover:bg-muted/50",
                        !n.read && "bg-muted/30 border-primary/30"
                      )}
                      onClick={() => markAsRead(n.id)}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="mt-1">
                              <Icon className={cn("h-6 w-6", !n.read ? "text-primary" : "text-muted-foreground")} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{EVENT_TYPE_LABELS[n.eventType] || n.eventType}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{n.title}</span>
                          {!n.read && <Badge variant="default">New</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">{n.description}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{EVENT_TYPE_LABELS[n.eventType] || n.eventType}</span>
                          <span>·</span>
                          <span>{new Date(n.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      {n.href && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={n.href} className="ml-2 mt-1 text-primary hover:underline flex items-center gap-1" prefetch={false} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>Go to related item</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 