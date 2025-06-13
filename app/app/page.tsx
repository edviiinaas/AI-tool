"use client"

import { ChatArea } from "@/components/app/chat-area"
import { useChat } from "@/hooks/use-chat" // We'll need to create this hook
import { Loader2 } from "lucide-react"

export default function AppPage() {
  const { 
    conversation,
    messages,
    onNewMessage,
    onAgentResponse,
    onEditMessage,
    onUpdateMessageStatus,
    isLoadingConversation 
  } = useChat()

  if (isLoadingConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ChatArea
      conversation={conversation}
      messages={messages}
      onNewMessage={onNewMessage}
      onAgentResponse={onAgentResponse}
      onEditMessage={onEditMessage}
      onUpdateMessageStatus={onUpdateMessageStatus}
      isLoadingConversation={isLoadingConversation}
    />
  )
}
