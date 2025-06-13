"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "@/components/app/app-header"
import { AgentPanel } from "@/components/app/agent-panel"
import { HelpWidget } from "@/components/app/help-widget"
import type { Conversation } from "@/lib/types" // Ensure Conversation is imported
import { useAuth } from "@/contexts/auth-context" // To get user plan

interface ClientAppPagesLayoutProps {
  children: React.ReactNode
  // Props that ChatPage will provide for its context
  conversations?: Conversation[]
  selectedConversationId?: string | null
  onSelectConversation?: (conversationId: string) => void
  onCreateNewChat?: () => void
  onRenameConversation?: (conversationId: string, newTitle: string) => void
  activeAgentIds?: string[]
  onToggleAgent?: (agentId: string, isActive: boolean) => void
  appHeaderProps?: {
    // Props for AppHeader, including export functionality
    pageTitle?: string
    selectedConversation?: Conversation | null
    onExportConversation?: (conversation: Conversation) => void
  }
}

export default function ClientAppPagesLayout({
  children,
  conversations,
  selectedConversationId,
  onSelectConversation = () => {},
  onCreateNewChat = () => {},
  onRenameConversation = () => {},
  activeAgentIds = [],
  onToggleAgent = () => {},
  appHeaderProps = {},
}: ClientAppPagesLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth() // Get user for plan type

  const [isConversationPanelOpen, setIsConversationPanelOpen] = useState(true)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  // Determine if side panels should be shown based on route
  const showSidePanels = pathname === "/app" || pathname === "/app/" // Only for the main chat page

  // Determine user plan for AgentPanel
  const userPlan = user?.companyName?.toLowerCase().includes("pro")
    ? "pro"
    : ("starter" as "starter" | "pro" | "enterprise")

  // Default AppHeader props if not overridden by ChatPage
  const defaultAppHeaderProps = {
    pageTitle: "Dashboard", // Default title
    ...appHeaderProps, // Spread props from ChatPage, which might include selectedConversation and onExportConversation
    onToggleSidebar: handleToggleSidebar,
    isSidebarOpen: isSidebarOpen,
    onExportConversation: appHeaderProps.onExportConversation && appHeaderProps.selectedConversation
      ? () => appHeaderProps.onExportConversation?.(appHeaderProps.selectedConversation!)
      : undefined,
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 dark:bg-zinc-900">
      <AppHeader {...defaultAppHeaderProps} />
      <div className="flex flex-1 overflow-hidden">
        {showSidePanels && (
          <div
            className={`transition-all duration-300 ease-in-out ${
              isConversationPanelOpen ? "w-72 md:w-80" : "w-0"
            } overflow-hidden border-r dark:border-zinc-700`}
          >
            {/* <ConversationHistory /> */}
          </div>
        )}
        <main className="flex flex-1 flex-col gap-4 p-0 overflow-y-auto bg-background dark:bg-zinc-950">
          {/* BreadcrumbNav is now part of AppHeader or specific page layouts if needed globally */}
          {/* <BreadcrumbNav /> */}
          <div className="flex-1 flex flex-col h-full">{children}</div>
        </main>
        {showSidePanels && (
          <div
            className={`transition-all duration-300 ease-in-out ${
              isAgentPanelOpen ? "w-72 md:w-80" : "w-0"
            } overflow-hidden border-l dark:border-zinc-700`}
          >
            <AgentPanel />
          </div>
        )}
      </div>
      <HelpWidget />
      {/* Button to toggle conversation panel - example, can be placed in header */}
      {showSidePanels && (
        <button
          onClick={() => setIsConversationPanelOpen(!isConversationPanelOpen)}
          className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground p-2 rounded-full shadow-lg md:hidden"
          aria-label="Toggle conversations panel"
        >
          {isConversationPanelOpen ? "<" : ">"}
        </button>
      )}
      {/* Button to toggle agent panel - example */}
      {showSidePanels && (
        <button
          onClick={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
          className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-2 rounded-full shadow-lg md:hidden"
          aria-label="Toggle agents panel"
        >
          {isAgentPanelOpen ? ">" : "<"}
        </button>
      )}
    </div>
  )
}
