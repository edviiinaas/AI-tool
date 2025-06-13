"use client"

import { useState } from "react"
import { SettingsTabs } from "@/components/app/settings/settings-tabs"
import { ProfileSettingsForm } from "@/components/app/settings/profile-settings-form"
import { SecuritySettingsForm } from "@/components/app/settings/security-settings-form"
import { NotificationSettingsForm } from "@/components/app/settings/notification-settings-form" // Import
import { ApiKeysSettingsForm } from "@/components/app/settings/api-keys-settings-form"
import { AppSettingsForm } from "@/components/app/settings/app-settings-form"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState("profile")
  const { user, updateUserMetadata } = useAuth()

  const handleSaveProfile = (data: Partial<NonNullable<typeof user>>) => {
    if (!user) return
    updateUserMetadata(data)
  }

  if (!user) {
    return <div>Loading user...</div>
  }

  const tabs = [
    { value: "profile", label: "Profile", component: <ProfileSettingsForm user={user as any} onSave={handleSaveProfile} /> },
    { value: "app", label: "App Settings", component: <AppSettingsForm /> },
    { value: "security", label: "Security", component: <SecuritySettingsForm /> },
    { value: "notifications", label: "Notifications", component: <NotificationSettingsForm /> },
    { value: "apiKeys", label: "API Keys", component: <ApiKeysSettingsForm /> },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-6">{tabs.find((tab) => tab.value === activeTab)?.component}</div>
    </div>
  )
}
