import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FIX: Added back generateMockId
export const generateMockId = (prefix = "id") => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
}

// Desktop Notification Utilities
export const requestDesktopNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification")
    return "denied"
  }
  if (Notification.permission === "granted") {
    return "granted"
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission
  }
  return "denied"
}

export const showDesktopNotification = (title: string, body: string, icon?: string): void => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification")
    return
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, { body, icon: icon || "/icons/icon-192x192.png" })
    // You can handle notification.onclick, notification.onclose etc. here
  } else if (Notification.permission !== "denied") {
    // This part is mostly handled by the context now, but good for direct use
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body, icon: icon || "/icons/icon-192x192.png" })
      }
    })
  } else {
    console.log("Desktop notification permission denied.")
  }
}
