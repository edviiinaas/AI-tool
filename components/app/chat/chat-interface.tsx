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
  
  const { messages, selectedAgents, addMessage, loadMessages, subscribeToMessages } = useChatStore()

  useEffect(() => {
    loadMessages(CONVERSATION_ID)
    subscribeToMessages(CONVERSATION_ID)
    // eslint-disable-next-line
  }, [])

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
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUiError("File is too large. Maximum size is 10MB.")
        return
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUiError("Unsupported file type. Please upload PDF, DOCX, or XLSX.")
        return
      }
      setUiError(null)
      setFile(file)
      setFilePreview(file.name)
      setIsExtracting(true)
      try {
        // 1. Upload file to Supabase Storage
        const ext = file.name.split('.').pop()
        const filePath = `${user?.id}/${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(filePath, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('chat-files').getPublicUrl(filePath)
        // 2. Extract content
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Failed to extract file content')
        const data = await res.json()
        setExtractedFileContent(data.files?.[0] || null)
        // 3. Store file metadata in Supabase
        const { data: fileRow, error: fileError } = await supabase.from('files').insert([
          {
            user_id: user?.id,
            chat_id: CONVERSATION_ID,
            file_url: publicUrl,
            file_type: file.type,
            extracted_text: data.files?.[0]?.extractedText || '',
            extracted_images: data.files?.[0]?.extractedImages || [],
            created_at: new Date().toISOString(),
            original_name: file.name,
          }
        ]).select().single()
        if (fileError) throw fileError
        setFileId(fileRow.id)
        toast.success(`File processed and saved: ${file.name}`)
      } catch (err: any) {
        setExtractedFileContent(null)
        setFileId(null)
        setUiError('File extraction or upload failed: ' + (err.message || 'Unknown error'))
        toast.error('File extraction or upload failed: ' + (err.message || 'Unknown error'))
      } finally {
        setIsExtracting(false)
      }
    }
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
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
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
          <Info className="h-8 w-8" />
          <div className="text-lg font-semibold">No messages yet</div>
          <div className="text-sm">Start the conversation by selecting an agent and sending a message.</div>
        </div>
      )}
      {selectedAgents.length === 0 && (
        <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded my-2">
          <Info className="h-4 w-4" />
          <span>Select at least one agent to start chatting.</span>
        </div>
      )}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          )}
          {groupedMessages.map((group, i) => {
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
          })}
        </div>
      </ScrollArea>

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
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
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
    </div>
  )
} 