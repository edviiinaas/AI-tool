import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-settings-context"
import ClientAppPagesLayout from "./ClientAppPagesLayout" // Ensure this path and casing are correct

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ClientAppPagesLayout>{children}</ClientAppPagesLayout>
      </NotificationProvider>
    </AuthProvider>
  )
}
