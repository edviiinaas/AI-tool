"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, Pencil, Trash2, Smile, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Database } from "@/types/supabase"
import { Picker } from 'emoji-mart/react'
import 'emoji-mart/css/emoji-mart.css'

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    full_name: string
    avatar_url: string
  }
  is_edited?: boolean
  file_url?: string
  file_type?: string
}

export function ChatInterface() {
  const { user } = useAuth()
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ user_id: string; full_name: string }[]>([])
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const MESSAGES_PER_PAGE = 50
  const [reactionsByMessage, setReactionsByMessage] = useState<Record<string, string[]>>({})
  const [lastReadAt, setLastReadAt] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const { new: newMessage, old: oldMessage, eventType } = payload as any
          if (eventType === "INSERT") {
            setMessages((current) => [...current, newMessage])
          } else if (eventType === "UPDATE") {
            setMessages((current) =>
              current.map((msg) =>
                msg.id === newMessage.id ? newMessage : msg
              )
            )
          } else if (eventType === "DELETE") {
            setMessages((current) =>
              current.filter((msg) => msg.id !== oldMessage.id)
            )
          }
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('typing_status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'typing' },
        (payload) => {
          fetchTypingUsers()
        }
      )
      .subscribe()
    fetchTypingUsers()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMessages = async (opts?: { append?: boolean }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*, user:profiles(full_name, avatar_url)")
        .order("created_at", { ascending: true })
        .range(0, page * MESSAGES_PER_PAGE - 1)
      if (error) throw error
      if (opts?.append) {
        setMessages((prev) => [...data.filter((m: any) => !prev.some((pm) => pm.id === m.id)), ...prev])
      } else {
        setMessages(data || [])
      }
      setHasMore((data?.length || 0) === page * MESSAGES_PER_PAGE)
      scrollToBottom()
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setIsInitialLoading(false)
      setIsLoadingMore(false)
    }
  }

  const fetchTypingUsers = async () => {
    const { data } = await supabase
      .from('typing')
      .select('user_id, full_name, last_typed_at')
      .order('last_typed_at', { ascending: false })
    const now = Date.now()
    setTypingUsers(
      (data || []).filter(
        (u) =>
          u.user_id !== user?.id &&
          u.last_typed_at &&
          now - new Date(u.last_typed_at).getTime() < 5000
      )
    )
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        user_id: user.id,
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const editMessage = async (messageId: string) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabase
        .from("messages")
        .update({
          content: editContent.trim(),
          is_edited: true,
        })
        .eq("id", messageId)
        .eq("user_id", user?.id)

      if (error) throw error
      setEditingMessageId(null)
      setEditContent("")
    } catch (error) {
      console.error("Error editing message:", error)
      toast.error("Failed to edit message")
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("user_id", user?.id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Failed to delete message")
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value)
      if (user) {
        supabase.from('typing').upsert({
          user_id: user.id,
          full_name: user.fullName || user.email || 'User',
          last_typed_at: new Date().toISOString(),
        })
      }
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => {
        if (user) {
          supabase.from('typing').delete().eq('user_id', user.id)
        }
      }, 5000)
    },
    [user]
  )

  // Filtered messages
  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(search.toLowerCase())
    )
  }, [messages, search])

  // Infinite scroll: load more when scrolled to top
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingMore) {
      setIsLoadingMore(true)
      setPage((p) => p + 1)
    }
  }

  // Fetch more messages when page increases
  useEffect(() => {
    if (page > 1) {
      fetchMessages({ append: true })
    }
    // eslint-disable-next-line
  }, [page])

  if (isInitialLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Search bar */}
      <div className="p-4 border-b bg-background">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full"
        />
      </div>
      <ScrollArea ref={scrollRef} className="flex-1 p-4" onScroll={handleScroll}>
        <div className="space-y-4">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          {filteredMessages.map((message) => {
            const isCurrentUser = message.user_id === user?.id
            const messageReactions = reactionsByMessage[message.id] || []
            const isUnread = message.created_at > lastReadAt
            return (
              <div
                key={message.id}
                className={cn(
                  "group flex items-start gap-2",
                  isCurrentUser && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user.avatar_url} />
                  <AvatarFallback>
                    {message.user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "relative rounded-lg px-4 py-2 max-w-[80%]",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {editingMessageId === message.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        editMessage(message.id)
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingMessageId(null)
                            setEditContent("")
                          }
                        }}
                      />
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMessageId(null)
                          setEditContent("")
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      {message.file_url && (
                        <div className="mb-2">
                          {message.file_type?.startsWith('image/') ? (
                            <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                              <img src={message.file_url} alt="attachment" className="max-h-48 rounded" />
                            </a>
                          ) : (
                            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              {message.file_url.split('/').pop()}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                          {message.is_edited && <span className="ml-1 italic text-muted-foreground">(edited)</span>}
                        </p>
                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-2" title="Reply (thread)">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 17L4 12L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 18V16C20 13.7909 18.2091 12 16 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Button>
                      </div>
                      {isUnread && <div className="w-2 h-2 bg-primary rounded-full absolute -left-3 top-1" title="Unread" />}
                    </>
                  )}
                  {isCurrentUser && !editingMessageId && (
                    <div className="absolute -right-8 top-0 hidden group-hover:flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingMessageId(message.id)
                          setEditContent(message.content)
                        }}
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteMessage(message.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {typingUsers.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {typingUsers.map((u) => u.full_name).join(', ')} typing...
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={sendMessage} className="border-t p-4 relative">
        <div className="flex gap-2 items-center">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker((v) => !v)}>
              <Smile className="h-4 w-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-10 left-0 z-50">
                <Picker
                  onEmojiSelect={(emoji: any) => {
                    setNewMessage((msg) => msg + (emoji.native || emoji.skins?.[0]?.native || ""))
                    setShowEmojiPicker(false)
                  }}
                  theme="light"
                />
              </div>
            )}
          </div>
          <Input
            value={newMessage}
            onChange={handleInput}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 