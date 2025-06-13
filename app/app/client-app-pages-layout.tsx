"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AppHeader } from "@/components/app/app-header"
import { ConversationHistory } from "@/components/app/conversation-history"
import { AgentPanel } from "@/components/app/agent-panel"
import { HelpWidget } from "@/components/app/help-widget"
import type { Conversation } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

interface ClientAppPagesLayoutProps {
  children: React.ReactNode
  conversations?: Conversation[]
  selectedConversationId?: string | null
  onSelectConversation?: (conversationId: string) => void
  onCreateNewChat?: () => void
  onRenameConversation?: (conversationId: string, newTitle: string) => void
  activeAgentIds?: string[]
  onToggleAgent?: (agentId: string, isActive: boolean) => void
  appHeaderProps?: {
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
  const { user } = useAuth()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [isConversationPanelOpen, setIsConversationPanelOpen] = useState(!isMobile)
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(!isMobile)

  useEffect(() => {
    setIsConversationPanelOpen(!isMobile)
    setIsAgentPanelOpen(!isMobile)
  }, [isMobile])

  const showSidePanels = pathname === "/app" || pathname === "/app/"
  const userPlan = user?.companyName?.toLowerCase().includes("pro")
    ? "pro"
    : ("starter" as "starter" | "pro" | "enterprise")

  const defaultAppHeaderProps = {
    pageTitle: "Dashboard",
    onToggleConversationPanel: () => setIsConversationPanelOpen(!isConversationPanelOpen),
    ...appHeaderProps,
  }

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 dark:bg-zinc-900">
      <AppHeader {...defaultAppHeaderProps} />
      <div className="flex flex-1 overflow-hidden">
        {showSidePanels && isMobile && (
          <AnimatePresence>
            {isConversationPanelOpen && (
              <>
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sidebarVariants}
                  className="fixed inset-0 z-40 md:hidden"
                >
                  <ConversationHistory
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={(id) => {
                      onSelectConversation(id)
                      setIsConversationPanelOpen(false)
                    }}
                    onCreateNewChat={() => {
                      onCreateNewChat()
                      setIsConversationPanelOpen(false)
                    }}
                    onRenameConversation={onRenameConversation}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-30 md:hidden"
                  onClick={() => setIsConversationPanelOpen(false)}
                />
              </>
            )}
          </AnimatePresence>
        )}

        {showSidePanels && !isMobile && (
          <div
            className={`transition-all duration-300 ease-in-out ${
              isConversationPanelOpen ? "w-72 md:w-80" : "w-0"
            } overflow-hidden border-r dark:border-zinc-700`}
          >
            <ConversationHistory
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={onSelectConversation}
              onCreateNewChat={onCreateNewChat}
              onRenameConversation={onRenameConversation}
            />
          </div>
        )}

        <main
          className="flex flex-1 flex-col gap-4 p-0 overflow-y-auto bg-background dark:bg-zinc-950"
          onPanEnd={(event, info) => {
            if (!isMobile || !showSidePanels) return
            if (info.offset.x > 100 && info.velocity.x > 200) {
              setIsConversationPanelOpen(true)
            }
          }}
        >
          <div className="flex-1 flex flex-col h-full">{children}</div>
        </main>

        {showSidePanels && (
          <div
            className={`hidden md:block transition-all duration-300 ease-in-out ${
              isAgentPanelOpen ? "w-72 md:w-80" : "w-0"
            } overflow-hidden border-l dark:border-zinc-700`}
          >
            <AgentPanel activeAgentIds={activeAgentIds} onToggleAgent={onToggleAgent} userPlan={userPlan} />
          </div>
        )}
      </div>
      <HelpWidget />
    </div>
  )
}
