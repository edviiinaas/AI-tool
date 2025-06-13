import React from "react"
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'

export type ChatSession = {
  id: string
  title: string | null
  created_at: string
}

interface Props {
  chats: ChatSession[]
  selectedChatId: string | null
  onSelectChat: (id: string) => void
  onNewChat: () => void
  onRenameChat: (id: string, newTitle: string) => void
  onDeleteChat: (id: string) => void
  loading?: boolean
}

export const ChatHistorySidebar: React.FC<Props> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  loading = false,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setDeletingId(id)
      try {
        await onDeleteChat(id)
        toast.success('Chat deleted')
      } catch {
        toast.error('Failed to delete chat')
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <aside className="w-64 border-r h-full flex flex-col bg-white">
      <div className="p-4 flex justify-between items-center border-b">
        <span className="font-bold">Chats</span>
        <button className="btn btn-primary" onClick={() => { onNewChat(); toast.success('Chat created') }}>+ New</button>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : chats.length === 0 ? (
          <li className="p-4 text-gray-500">No chats yet</li>
        ) : (
          chats.map(chat => (
            <li
              key={chat.id}
              className={`p-3 cursor-pointer flex justify-between items-center ${chat.id === selectedChatId ? "bg-blue-100" : ""}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <span>{chat.title || "Untitled Chat"}</span>
              <div className="flex gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    const newTitle = prompt("Rename chat:", chat.title || "");
                    if (newTitle) { onRenameChat(chat.id, newTitle); toast.success('Chat renamed') }
                  }}
                >✏️</button>
                <button
                  disabled={deletingId === chat.id}
                  onClick={e => { e.stopPropagation(); handleDelete(chat.id) }}
                >🗑️</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
} 