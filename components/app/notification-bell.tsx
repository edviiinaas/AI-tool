"use client"

import type React from "react"
import { Bell, CheckCheck, MessageSquare, Users2, CreditCard, BookOpen, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { AppNotification } from "@/lib/types"
import { useNotificationSystem } from "@/contexts/notification-settings-context" // Updated hook name

// Helper to get icon for notification type
const getNotificationIcon = (eventType: AppNotification["eventType"]): React.ElementType => {
  switch (eventType) {
    case "agentResponse":
      return MessageSquare
    case "docAnalysisComplete":
      return BookOpen
    case "teamInviteAccepted":
      return Users2
    case "billingSuccess":
      return CreditCard
    case "newFeature":
      return Zap
    case "taskMention":
      return AlertCircle
    default:
      return Bell
  }
}

export function NotificationBell() {
  const { notifications, markAsRead, markAllAsRead, unreadCount, addNotification } = useNotificationSystem()

  const handleTestNotification = () => {
    addNotification({
      title: "Test Notification",
      description: "This is a test notification.",
      eventType: "newFeature",
      href: "/app/notifications"
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 min-w-4 justify-center rounded-full p-0.5 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Button variant="outline" size="sm" className="w-full mb-2" onClick={handleTestNotification}>
          Send Test Notification
        </Button>
        <ScrollArea className="h-[300px] md:h-[350px]">
          {notifications.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">You have no new notifications.</div>
          ) : (
            notifications.map((notification) => {
              const ItemContent = (
                <div className="flex items-start gap-3">
                  {(() => {
                    const IconComponent = notification.icon || getNotificationIcon(notification.eventType)
                    return (
                      <IconComponent
                        className={cn(
                          "h-4 w-4 mt-1 shrink-0",
                          notification.read ? "text-muted-foreground" : "text-primary",
                        )}
                      />
                    )
                  })()}
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        notification.read && "font-normal text-muted-foreground",
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className={cn("text-xs text-muted-foreground", notification.read && "text-muted-foreground/70")}>
                      {notification.description}
                    </p>
                    <p
                      className={cn(
                        "text-xs text-muted-foreground/80 mt-0.5",
                        notification.read && "text-muted-foreground/60",
                      )}
                    >
                      {notification.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {notification.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                      title="Mark as read"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "data-[highlighted]:bg-muted/50 cursor-pointer p-2",
                    !notification.read && "bg-muted/30 dark:bg-muted/20",
                  )}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  asChild={!!notification.href}
                >
                  {notification.href ? (
                    <Link href={notification.href} className="block w-full">
                      {ItemContent}
                    </Link>
                  ) : (
                    <div>{ItemContent}</div>
                  )}
                </DropdownMenuItem>
              )
            })
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center py-2 text-sm text-primary hover:text-primary focus:text-primary cursor-pointer"
          asChild
        >
          <Link href="/app/notifications">View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
