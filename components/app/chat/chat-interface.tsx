"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, Paperclip, Download, FileText, Sparkles, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { AgentSelector } from "./agent-selector"
import { MultiAgentResponse } from "./multi-agent-response"
import { useChatStore } from "@/lib/chat-store"
import { getMockAgentResponse, AGENT_SYSTEM_PROMPTS } from "@/lib/agents"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatHistorySidebar } from "./chat-history-sidebar"
import { Skeleton } from '@/components/ui/skeleton'
import Papa from 'papaparse'
import jsPDF from 'jspdf'

const CONVERSATION_ID = "default-conv" // TODO: Use real conversation id per chat

const AGENTS = [
  { id: "boq", name: "BOQ Analyzer", emoji: "📊", color: "border-blue-500", bg: "bg-blue-100", text: "text-blue-700" },
  { id: "price", name: "Price Prophet", emoji: "📈", color: "border-green-500", bg: "bg-green-100", text: "text-green-700" },
  { id: "supplier", name: "Supplier Scout", emoji: "🔍", color: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-700" },
  { id: "advisor", name: "Project Advisor", emoji: "🎯", color: "border-purple-500", bg: "bg-purple-100", text: "text-purple-700" },
  { id: "safety", name: "Safety Inspector", emoji: "🦺", color: "border-orange-500", bg: "bg-orange-100", text: "text-orange-700" },
  { id: "schedule", name: "Schedule Optimizer", emoji: "📅", color: "border-pink-500", bg: "bg-pink-100", text: "text-pink-700" },
]

const AGENT_ORDER = ["boq", "price", "supplier", "advisor", "safety", "schedule"]

export function ChatInterface() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [extractedFileContent, setExtractedFileContent] = useState<any | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [fileId, setFileId] = useState<string | null>(null)
  const [fileMap, setFileMap] = useState<Record<string, any>>({})
  const [replyTo, setReplyTo] = useState<any | null>(null)
  const [agentLoading, setAgentLoading] = useState<string | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)
  const [agentResponses, setAgentResponses] = useState<Record<string, any>>({})
  const [agentLoadingMap, setAgentLoadingMap] = useState<Record<string, boolean>>({})
  const [agentErrorMap, setAgentErrorMap] = useState<Record<string, string | null>>({})
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const { chats, selectedChatId, loadChats, selectChat, createNewChat, renameChat, deleteChat, messages, addMessage, selectedAgents, loadMessages } = useChatStore()

  useEffect(() => {
    if (user) loadChats(user.id)
  }, [user])

  useEffect(() => {
    if (selectedChatId) {
      setLoadingMessages(true)
      loadMessages(selectedChatId).finally(() => setLoadingMessages(false))
    }
  }, [selectedChatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch file metadata for messages with fileId
  useEffect(() => {
    const fileIds = Array.from(new Set(messages.map(m => m.fileId).filter(Boolean)))
    if (fileIds.length === 0) return
    const fetchFiles = async () => {
      const { data, error } = await supabase.from('files').select('*').in('id', fileIds)
      if (!error && data) {
        const map: Record<string, any> = {}
        data.forEach((f: any) => { map[f.id] = f })
        setFileMap(map)
      }
    }
    fetchFiles()
  }, [messages])

  // Fetch team members for the current workspace/user
  useEffect(() => {
    if (!user) return
    supabase.from("users").select("id, full_name, email, avatar_url, role").then(({ data }) => {
      setTeamMembers(data || [])
    })
  }, [user])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  // File validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"
  ]

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || selectedAgents.length === 0) return

    setIsLoading(true)
    setAgentError(null)
    setAgentResponses({})
    setAgentLoadingMap({})
    setAgentErrorMap({})
    try {
      // Add user message
      const userMessage = {
        id: crypto.randomUUID(),
        type: 'user' as const,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        fileId: fileId || undefined,
        replyTo: replyTo?.id || null,
      }
      await addMessage(userMessage)

      // Multi-agent chaining: always use AGENT_ORDER
      let context: Record<string, any> = {}
      let previousAgentMsg: any = null
      for (const agentId of AGENT_ORDER) {
        if (!selectedAgents.includes(agentId)) continue
        setAgentLoadingMap(prev => ({ ...prev, [agentId]: true }))
        setAgentErrorMap(prev => ({ ...prev, [agentId]: null }))
        try {
          // Build the message chain: user message, then previous agent as assistant
          const messages = [
            { role: 'system', content: AGENT_SYSTEM_PROMPTS[agentId] },
            { role: 'user', content: newMessage.trim() },
          ]
          if (previousAgentMsg) {
            messages.push({
              role: 'assistant',
              content: previousAgentMsg.content
            })
          }
          const res = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages,
              agentConfig: { agentId, model: 'gpt-4o' },
              files: extractedFileContent ? [extractedFileContent] : [],
              context
            })
          })
          let content = ''
          let richContent = null
          if (res.ok) {
            const data = await res.json()
            content = data.choices?.[0]?.message?.content || ''
            try {
              const match = content.match(/```json([\s\S]*?)```/)
              if (match) {
                richContent = JSON.parse(match[1])
              }
            } catch {}
          } else {
            content = 'Error: Unable to get agent response.'
            setAgentErrorMap(prev => ({ ...prev, [agentId]: 'Agent failed to respond.' }))
          }
          const agentMsg = {
            id: crypto.randomUUID(),
            type: 'ai' as const,
            content,
            agentId,
            createdAt: new Date().toISOString(),
            richContent,
            replyTo: replyTo?.id || null,
          }
          await addMessage(agentMsg)
          context[agentId] = agentMsg
          setAgentResponses(prev => ({ ...prev, [agentId]: agentMsg }))
          previousAgentMsg = agentMsg
        } catch (err) {
          setAgentErrorMap(prev => ({ ...prev, [agentId]: 'Agent failed to respond.' }))
        } finally {
          setAgentLoadingMap(prev => ({ ...prev, [agentId]: false }))
        }
      }
      setAgentLoading(null)
      setNewMessage("")
      setFile(null)
      setFilePreview(null)
      setExtractedFileContent(null)
      setFileId(null)
      setReplyTo(null)
    } catch (error) {
      setAgentError('all')
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setUiError("File is too large (max 10MB)")
      return
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUiError("Unsupported file type")
      return
    }
    setFile(file)
    setUiError(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.size > MAX_FILE_SIZE) {
        setUiError("File is too large (max 10MB)")
        return
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUiError("Unsupported file type")
        return
      }
      setFile(file)
      setUiError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleExportCSV = () => {
    const rows = [
      ['Time', 'Sender', 'Content', 'File'],
      ...messages.map((msg) => [
        msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '',
        msg.type === 'user' ? user?.fullName || user?.email : msg.agentId || 'AI',
        msg.content.replace(/\n/g, ' '),
        msg.fileId && fileMap[msg.fileId] ? fileMap[msg.fileId].file_url : ''
      ])
    ]
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSummarize = async () => {
    setIsSummarizing(true)
    setShowSummary(true)
    try {
      const chatText = messages.map((m) => `${m.type === 'user' ? (user?.fullName || user?.email) : (m.agentId || 'AI')}: ${m.content}`).join('\n')
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Summarize the following chat conversation in a concise, clear way for a project manager.' },
            { role: 'user', content: chatText }
          ],
          agentConfig: { agentId: 'summary', model: 'gpt-4o' },
        })
      })
      if (!res.ok) throw new Error('Failed to get summary')
      const data = await res.json()
      setSummary(data.choices?.[0]?.message?.content || 'No summary available.')
    } catch (err: any) {
      setSummary('Failed to generate summary: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSummarizing(false)
    }
  }

  // Group messages by sender for UI
  const groupedMessages = [] as typeof messages[]
  let lastSender: string | undefined
  let group: typeof messages = []
  messages.forEach((msg) => {
    const sender = msg.type === 'user' ? 'user' : msg.agentId || 'ai'
    if (sender !== lastSender && group.length > 0) {
      groupedMessages.push(group)
      group = []
    }
    group.push(msg)
    lastSender = sender
  })
  if (group.length > 0) groupedMessages.push(group)

  // Helper to get current user's role
  const getCurrentUserRole = () => teamMembers.find(m => m.id === user?.id)?.role

  function exportChatAsCSV(messages: any[]) {
    const csv = Papa.unparse(messages.map((m: any, i: number) => ({
      sender: m.type,
      content: m.content,
      createdAt: m.createdAt
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat.csv'
    a.click()
  }

  function exportChatAsPDF(messages: any[]) {
    const doc = new jsPDF()
    messages.forEach((m: any, i: number) => {
      doc.text(`${m.type}: ${m.content}`, 10, 10 + i * 10)
    })
    doc.save('chat.pdf')
  }

  const openAgentSettings = useCallback((agent: any) => {
    // TODO: Implement modal logic
    alert(`Open settings for agent: ${agent.name}`);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <AgentSelector onAgentSettings={openAgentSettings} />
        <button
          className="ml-auto px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/90"
          onClick={() => user && createNewChat(user.id)}
        >
          + New
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span>No messages yet</span>
          </div>
        ) : (
          groupedMessages.map((group, i) => (
            <div key={i}>{/* ... */}</div>
          ))
        )}
      </div>
      <form onSubmit={handleSendMessage} className="sticky bottom-0 bg-background p-4 border-t">
        {/* ...input controls... */}
      </form>
    </div>
  )
}
