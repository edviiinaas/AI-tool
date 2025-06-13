"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettingsForm } from "./profile-settings-form"
import { UserCircle, Shield, Bell, KeyRound } from "lucide-react"
import { SecuritySettingsForm } from "./security-settings-form"
import { NotificationSettingsForm } from "./notification-settings-form"
import { ApiKeysSettingsForm } from "./api-keys-settings-form" // New import

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10 mb-6">
        <TabsTrigger value="profile" className="py-2 sm:py-0">
          <UserCircle className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
          <span className="sm:hidden">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="py-2 sm:py-0">
          <Shield className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Security</span>
          <span className="sm:hidden">Security</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="py-2 sm:py-0">
          <Bell className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
          <span className="sm:hidden">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="apikeys" className="py-2 sm:py-0">
          <KeyRound className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">API Keys</span>
          <span className="sm:hidden">API Keys</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileSettingsForm />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettingsForm />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationSettingsForm />
      </TabsContent>
      <TabsContent value="apikeys">
        <ApiKeysSettingsForm /> {/* Changed from placeholder */}
      </TabsContent>
    </Tabs>
  )
}
