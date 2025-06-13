"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app/app-header"
import { SideMenu } from "@/components/app/side-menu"
import { cn } from "@/lib/utils"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <SideMenu isOpen={isSidebarOpen} />
      <main
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "md:pl-64" : "md:pl-0"
        )}
      >
        {children}
      </main>
    </div>
  )
}
