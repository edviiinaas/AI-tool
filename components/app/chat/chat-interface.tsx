"use client"

import { useEffect, useRef, useState } from "react"
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

  return (
    <div className="flex h-[80vh] border rounded-lg overflow-hidden">
      <ChatHistorySidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={selectChat}
        onNewChat={() => user && createNewChat(user.id)}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
      />
      <main className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-4">
            <AgentSelector />
            {/* Team Avatars */}
            <div className="flex -space-x-2 ml-4">
              {teamMembers.map((member) => (
                <div key={member.id} title={`${member.full_name || member.email} (${member.role})`} className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || member.email} />
                    <AvatarFallback>{(member.full_name || member.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {member.role === "admin" && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] rounded-full px-1">A</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export chat as CSV">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleSummarize} title="Summarize chat">
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {uiError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded my-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{uiError}</span>
            <Button variant="ghost" size="sm" onClick={() => setUiError(null)}>
              Dismiss
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {loadingMessages ? (
            <div className="flex flex-col gap-2 p-8 items-center justify-center">
              <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Info className="w-8 h-8 mb-2" />
              <div>No messages yet</div>
              <div className="text-xs">Start the conversation by sending a message.</div>
            </div>
          ) : (
            groupedMessages.map((group, i) => {
              const first = group[0]
              const isUser = first.type === 'user'
              return (
                <div key={i} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                  <div className={cn('flex flex-col max-w-[80%] gap-1', isUser ? 'items-end' : 'items-start')}>
                    <div className="flex items-center gap-2">
                      {!isUser && (
                        (() => {
                          const agent = AGENTS.find(a => a.id === first.agentId) || { emoji: "🤖", bg: "bg-muted", text: "text-muted-foreground" }
                          return (
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xl font-bold ${agent.bg} ${agent.text}`}
                              title={first.agentId}
                            >
                              {agent.emoji}
                            </div>
                          )
                        })()
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isUser ? user?.fullName || user?.email : (AGENTS.find(a => a.id === first.agentId)?.name || first.agentId || 'AI')}
                      </span>
                    </div>
                    {group.map((msg) => (
                      <div key={msg.id} className={cn('rounded-lg px-4 py-2 relative', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}> 
                        {msg.replyTo && (
                          <div className="absolute -top-5 left-2 right-2 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1 border mb-1">
                            Replying to: <span className="italic">{messages.find(m => m.id === msg.replyTo)?.content?.slice(0, 40) || 'Message'}</span>
                          </div>
                        )}
                        <div>{msg.content}</div>
                        {msg.fileId && fileMap[msg.fileId] && (
                          <div className="mt-2 p-2 rounded bg-background/50 border flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={fileMap[msg.fileId].file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-sm"
                            >
                              {fileMap[msg.fileId].original_name}
                            </a>
                            <span className="text-xs text-muted-foreground">{fileMap[msg.fileId].file_type}</span>
                            <span className="text-xs text-muted-foreground">{((fileMap[msg.fileId].file_size || 0) / 1024).toFixed(1)} KB</span>
                          </div>
                        )}
                        {msg.createdAt && (
                          <div className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                        )}
                        {getCurrentUserRole() === 'admin' && (
                          <button
                            className="absolute top-1 right-1 text-xs text-muted-foreground hover:underline"
                            onClick={() => setReplyTo(msg)}
                            title="Reply to this message"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleSendMessage} className="border-t p-4">
          {replyTo && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-muted rounded">
              <span className="text-xs">Replying to:</span>
              <span className="italic text-xs truncate max-w-xs">{replyTo.content?.slice(0, 60)}</span>
              {getCurrentUserRole() === 'admin' && (
                <Button type="button" size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                  Cancel
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || selectedAgents.length === 0}
              className="flex-1"
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={ALLOWED_FILE_TYPES.join(",")}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" disabled={isLoading || selectedAgents.length === 0 || isExtracting}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {(filePreview || isExtracting) && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <span>{filePreview}</span>
              {file && (
                <span className="ml-2">{file.type} • {(file.size / 1024).toFixed(1)} KB</span>
              )}
              {isExtracting ? (
                <span className="ml-2">Extracting...</span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setFilePreview(null)
                    setExtractedFileContent(null)
                    setFileId(null)
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          )}
          {agentLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for agent response...
            </div>
          )}
          {agentError && (
            <div className="mt-2 text-xs text-destructive">
              Error: Failed to get response from agent.
            </div>
          )}
        </form>

        <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chat Summary</DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-line text-sm">
              {isSummarizing ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating summary...
                </div>
              ) : (
                summary
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2 mb-2">
          <button className="btn btn-sm" onClick={() => exportChatAsCSV(messages)}>Export CSV</button>
          <button className="btn btn-sm" onClick={() => exportChatAsPDF(messages)}>Export PDF</button>
        </div>

        {/* File Upload Dropzone */}
        <div
          className={`my-2 p-4 border-2 rounded-lg border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-gray-500">{file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <button className="btn btn-xs btn-danger mt-1" onClick={e => { e.stopPropagation(); setFile(null) }}>Remove</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-500">
              <span className="text-lg">📄</span>
              <span>Drag & drop a file here, or <span className="underline">click to upload</span></span>
              <span className="text-xs">PDF, Word, Excel (max 10MB)</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={ALLOWED_FILE_TYPES.join(",")}
          />
        </div>
      </main>
    </div>
  )
} 