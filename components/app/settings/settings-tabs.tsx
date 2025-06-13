"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettingsForm } from "./profile-settings-form"
import { UserCircle, Shield, Bell, KeyRound } from "lucide-react"
import { SecuritySettingsForm } from "./security-settings-form"
import { NotificationSettingsForm } from "./notification-settings-form"
import { ApiKeysSettingsForm } from "./api-keys-settings-form" // New import
import type React from "react"

interface SettingsTabsProps {
  tabs: { value: string; label: string; component: React.ReactNode }[];
  activeTab: string;
  onTabChange: React.Dispatch<React.SetStateAction<string>>;
}

export function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  // Find the active tab object
  const activeTabObj = tabs.find(tab => tab.value === activeTab)

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10 mb-6">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} className="py-2 sm:py-0">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Only render the active tab's content */}
      {activeTabObj ? (
        <TabsContent key={activeTabObj.value} value={activeTabObj.value} forceMount>
          {activeTabObj.component}
        </TabsContent>
      ) : (
        <div className="p-4">Invalid tab selected.</div>
      )}
    </Tabs>
  )
}
