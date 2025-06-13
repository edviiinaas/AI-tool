"use client"

import { useNotificationSystem } from "@/contexts/notification-settings-context" // Updated hook name
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { BellRing, AlertTriangle } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationSettingsForm() {
  const { preferences, updatePreference, requestDesktopPermission, desktopPermissionStatus } = useNotificationSystem()

  const getChannelLabel = (channel: string) => {
    if (channel === "inApp") return "In-App"
    if (channel === "desktop") return "Desktop"
    return channel.charAt(0).toUpperCase() + channel.slice(1)
  }

  if (!preferences || preferences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications for different events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications for different events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {desktopPermissionStatus !== "granted" && (
          <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 rounded-md flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Desktop Notifications Disabled</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400/80 mb-2">
                {desktopPermissionStatus === "denied"
                  ? "You have denied permission for desktop notifications. Please enable them in your browser settings if you wish to receive them."
                  : "Enable desktop notifications to receive real-time alerts even when the app is in the background."}
              </p>
              {desktopPermissionStatus === "default" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={requestDesktopPermission} size="sm" variant="outline">
                        <BellRing className="mr-2 h-4 w-4" />
                        Enable Desktop Notifications
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Enable browser desktop notifications</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {preferences.map((pref) => (
          <div key={pref.eventType} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
            <h4 className="font-medium">{pref.label}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {pref.allowedChannels.map((channel) => (
                <TooltipProvider key={channel}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${pref.eventType}-${channel}`}
                          checked={pref.enabledChannels.includes(channel)}
                          onCheckedChange={(checked) => updatePreference(pref.eventType, channel, checked)}
                          disabled={channel === "desktop" && desktopPermissionStatus !== "granted"}
                        />
                        <Label htmlFor={`${pref.eventType}-${channel}`} className="text-sm">
                          {getChannelLabel(channel)}
                          {channel === "desktop" && desktopPermissionStatus === "denied" && " (Blocked)"}
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Toggle {getChannelLabel(channel)} notifications</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
