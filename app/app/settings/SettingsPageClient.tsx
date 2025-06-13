"use client"

import { useState } from "react"
import { SettingsTabs } from "@/components/app/settings/settings-tabs"
import { ProfileSettingsForm } from "@/components/app/settings/profile-settings-form"
import { SecuritySettingsForm } from "@/components/app/settings/security-settings-form"
import { NotificationSettingsForm } from "@/components/app/settings/notification-settings-form" // Import
import { ApiKeysSettingsForm } from "@/components/app/settings/api-keys-settings-form"

// Mock user data for demonstration
const mockUser = {
  id: "user_123",
  fullName: "John Doe",
  email: "john.doe@example.com",
  companyName: "BuildCraft Inc.",
  // Add other relevant fields
}

export default function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState("profile")
  const [user, setUser] = useState(mockUser) // In a real app, this would come from AuthContext or props

  const handleSaveProfile = (data: Partial<typeof mockUser>) => {
    setUser((prev) => ({ ...prev, ...data }))
    // Here you would typically call an API to save the data
    console.log("Profile data saved:", data)
  }

  const tabs = [
    { value: "profile", label: "Profile", component: <ProfileSettingsForm user={user} onSave={handleSaveProfile} /> },
    { value: "security", label: "Security", component: <SecuritySettingsForm /> },
    { value: "notifications", label: "Notifications", component: <NotificationSettingsForm /> }, // Added
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
