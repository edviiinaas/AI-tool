"use client"

import { ChatArea } from "@/components/app/chat-area"
import type { Conversation, Message } from "@/lib/types"

// These props are passed down from ClientAppPagesLayout via React.cloneElement
interface AppPageProps {
  conversation: Conversation | null
  messages: Message[]
  onNewMessage: (conversationId: string, message: Message) => void
  onAgentResponse: (conversationId: string, agentMessages: Message[]) => void
  onEditMessage: (conversationId: string, messageId: string, newText: string) => void
  onUpdateMessageStatus: (conversationId: string, messageId: string, status: Message["status"]) => void
  isLoadingConversation: boolean
}

export default function AppPage(props: AppPageProps) {
  // The ChatArea component expects these props to function correctly.
  // When no conversation is selected, it will render its own empty/welcome state.
  return <ChatArea {...props} />
}
