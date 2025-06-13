import { create } from 'zustand'
import { supabase } from './supabase'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  agentId?: string
  richContent?: any
  createdAt?: string
  fileId?: string
  replyTo?: string | null
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

interface ChatStore {
  messages: ChatMessage[]
  selectedAgents: string[]
  mode: 'single' | 'multi'
  addMessage: (msg: ChatMessage) => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  subscribeToMessages: (conversationId: string) => void
  setSelectedAgents: (agents: string[] | ((prev: string[]) => string[])) => void
  setMode: (mode: 'single' | 'multi') => void
  clearMessages: () => void
  setTyping: (userId: string, isTyping: boolean) => void
  onlineUsers: string[]
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  selectedAgents: [],
  mode: 'single',
  onlineUsers: [],
  setSelectedAgents: (agents) => {
    set((state) => ({
      selectedAgents: typeof agents === 'function' ? agents(state.selectedAgents) : agents,
    }))
  },
  setMode: (mode: 'single' | 'multi') => set({ mode }),
  clearMessages: () => set({ messages: [] }),
  addMessage: async (msg) => {
    set((state) => ({ messages: [...state.messages, msg] }))
    // Persist to Supabase
    await supabase.from('messages').insert({
      id: msg.id,
      sender: msg.type === 'user' ? 'user' : msg.agentId || 'ai',
      content: msg.content,
      rich_content: msg.richContent || null,
      created_at: msg.createdAt || new Date().toISOString(),
      // Add conversation_id, user_id, file_id as needed
    })
  },
  loadMessages: async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (!error && data) {
      set({ messages: data.map((m: any) => ({
        id: m.id,
        type: m.sender === 'user' ? 'user' : 'ai',
        content: m.content,
        agentId: m.sender !== 'user' ? m.sender : undefined,
        richContent: m.rich_content,
        createdAt: m.created_at,
        fileId: m.file_id,
      })) })
    }
  },
  subscribeToMessages: (conversationId) => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          set((state) => ({
            messages: [...state.messages, {
              id: payload.new.id,
              type: payload.new.sender === 'user' ? 'user' : 'ai',
              content: payload.new.content,
              agentId: payload.new.sender !== 'user' ? payload.new.sender : undefined,
              richContent: payload.new.rich_content,
              createdAt: payload.new.created_at,
              fileId: payload.new.file_id,
            }],
          }))
        }
      })
      .subscribe()
    // Presence/typing channel
    const presenceChannel = supabase.channel('chat_presence')
      .on('broadcast', { event: 'typing' }, (payload) => {
        set((state) => {
          const { userId, isTyping } = payload.payload
          let onlineUsers = state.onlineUsers
          if (isTyping && !onlineUsers.includes(userId)) {
            onlineUsers = [...onlineUsers, userId]
          } else if (!isTyping && onlineUsers.includes(userId)) {
            onlineUsers = onlineUsers.filter(id => id !== userId)
          }
          return { onlineUsers }
        })
      })
      .subscribe()
  },
  setTyping: (userId, isTyping) => {
    supabase.channel('chat_presence').send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping }
    })
  },
})) 