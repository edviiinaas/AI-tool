"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-settings-context"
import { ProductTourProvider } from "@/components/app/product-tour-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <ProductTourProvider>{children}</ProductTourProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
