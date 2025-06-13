"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { NotificationPreference, NotificationEventType, NotificationChannel, AppNotification } from "@/lib/types"
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/constants"
import { generateMockId, showDesktopNotification } from "@/lib/utils"

interface NotificationSettingsContextType {
  preferences: NotificationPreference[]
  updatePreference: (eventType: NotificationEventType, channel: NotificationChannel, enabled: boolean) => void
  isChannelEnabled: (eventType: NotificationEventType, channel: NotificationChannel) => boolean
  requestDesktopPermission: () => void
  desktopPermissionStatus: NotificationPermission | "loading"
  notifications: AppNotification[]
  addNotification: (newNotification: Omit<AppNotification, "id" | "timestamp" | "read">) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  unreadCount: number
}

const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined)

const initialMockNotifications: AppNotification[] = [
  {
    id: "1",
    title: "New Agent Response",
    description: "Magnus has finished analyzing 'Project Titan Blueprint'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    eventType: "agentResponse",
    href: "/app?conversationId=proj_titan",
  },
  {
    id: "2",
    title: "Team Member Joined",
    description: "Sarah Connor has accepted your invitation to join the workspace.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    eventType: "teamInviteAccepted",
    href: "/app/team",
  },
]

// FIX: Renamed NotificationSettingsProvider to NotificationProvider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(() => {
    if (typeof window !== "undefined") {
      const storedPrefs = localStorage.getItem("notificationPreferences")
      return storedPrefs ? JSON.parse(storedPrefs) : DEFAULT_NOTIFICATION_PREFERENCES
    }
    return DEFAULT_NOTIFICATION_PREFERENCES
  })
  const [desktopPermissionStatus, setDesktopPermissionStatus] = useState<NotificationPermission | "loading">("loading")
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== "undefined") {
      const storedNotifs = localStorage.getItem("appNotifications")
      return storedNotifs
        ? JSON.parse(storedNotifs, (key, value) => {
            if (key === "timestamp" && typeof value === "string") {
              return new Date(value)
            }
            return value
          })
        : initialMockNotifications
    }
    return initialMockNotifications
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notificationPreferences", JSON.stringify(preferences))
    }
  }, [preferences])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("appNotifications", JSON.stringify(notifications))
    }
  }, [notifications])

  useEffect(() => {
    if ("Notification" in window) {
      setDesktopPermissionStatus(Notification.permission)
    } else {
      setDesktopPermissionStatus("denied")
    }
  }, [])

  const requestDesktopPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setDesktopPermissionStatus("denied")
      return
    }
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      setDesktopPermissionStatus(permission)
    }
  }, [])

  const updatePreference = useCallback(
    (eventType: NotificationEventType, channel: NotificationChannel, enabled: boolean) => {
      setPreferences((prevPrefs) =>
        prevPrefs.map((pref) => {
          if (pref.eventType === eventType) {
            const newEnabledChannels = enabled
              ? [...new Set([...pref.enabledChannels, channel])]
              : pref.enabledChannels.filter((ch) => ch !== channel)
            return { ...pref, enabledChannels: newEnabledChannels }
          }
          return pref
        }),
      )
    },
    [],
  )

  const isChannelEnabled = useCallback(
    (eventType: NotificationEventType, channel: NotificationChannel): boolean => {
      const pref = preferences.find((p) => p.eventType === eventType)
      return pref ? pref.enabledChannels.includes(channel) : false
    },
    [preferences],
  )

  const addNotification = useCallback(
    (newNotificationData: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const fullNotification: AppNotification = {
        ...newNotificationData,
        id: generateMockId("notif"),
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [fullNotification, ...prev.slice(0, 49)])

      if (isChannelEnabled(fullNotification.eventType, "desktop") && desktopPermissionStatus === "granted") {
        showDesktopNotification(fullNotification.title, fullNotification.description, "/icons/icon-72x72.png")
      }
    },
    [isChannelEnabled, desktopPermissionStatus],
  )

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationSettingsContext.Provider
      value={{
        preferences,
        updatePreference,
        isChannelEnabled,
        requestDesktopPermission,
        desktopPermissionStatus,
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationSettingsContext.Provider>
  )
}

export const useNotificationSystem = () => {
  const context = useContext(NotificationSettingsContext)
  if (context === undefined) {
    throw new Error("useNotificationSystem must be used within a NotificationProvider")
  }
  return context
}
