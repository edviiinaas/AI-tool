import { useState, useCallback } from "react"
import type { Conversation, Message } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function useChat() {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const { toast } = useToast()

  const onNewMessage = useCallback(async (conversationId: string, message: Message) => {
    try {
      setMessages((prev: Message[]) => [...prev, message])
      
      // Save to database
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          content: message.text,
          sender: message.sender,
          status: message.status
        })

      if (error) throw error
    } catch (error) {
      console.error("Error saving message:", error)
      toast({
        title: "Error",
        description: "Failed to save message. Please try again.",
        variant: "destructive"
      })
    }
  }, [toast])

  const onAgentResponse = useCallback(async (conversationId: string, agentMessages: Message[]) => {
    try {
      setMessages((prev: Message[]) => [...prev, ...agentMessages])
      
      // Save agent responses to database
      const { error } = await supabase
        .from("messages")
        .insert(
          agentMessages.map(msg => ({
            conversation_id: conversationId,
            content: msg.text,
            sender: msg.sender,
            status: msg.status
          }))
        )

      if (error) throw error
    } catch (error) {
      console.error("Error saving agent responses:", error)
      toast({
        title: "Error",
        description: "Failed to save agent responses. Please try again.",
        variant: "destructive"
      })
    }
  }, [toast])

  const onEditMessage = useCallback(async (conversationId: string, messageId: string, newText: string) => {
    try {
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId ? { ...msg, text: newText } : msg
        )
      )
      
      // Update in database
      const { error } = await supabase
        .from("messages")
        .update({ content: newText })
        .eq("id", messageId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating message:", error)
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive"
      })
    }
  }, [toast])

  const onUpdateMessageStatus = useCallback(async (
    conversationId: string,
    messageId: string,
    status: Message["status"]
  ) => {
    try {
      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === messageId ? { ...msg, status } : msg
        )
      )
      
      // Update status in database
      const { error } = await supabase
        .from("messages")
        .update({ status })
        .eq("id", messageId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating message status:", error)
      toast({
        title: "Error",
        description: "Failed to update message status. Please try again.",
        variant: "destructive"
      })
    }
  }, [toast])

  return {
    conversation,
    messages,
    onNewMessage,
    onAgentResponse,
    onEditMessage,
    onUpdateMessageStatus,
    isLoadingConversation
  }
} 