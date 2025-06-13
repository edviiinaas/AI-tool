import { create } from 'zustand'
import { supabase } from './supabase'
import { getUserChats, createChat, renameChat, deleteChat, getChatMessages } from './supabaseChats'
import { getAgents, createAgent as supaCreateAgent, updateAgent as supaUpdateAgent, deleteAgent as supaDeleteAgent, Agent as SupabaseAgent } from './supabaseAgents'

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

export interface ChatSession {
  id: string
  title: string | null
  created_at: string
}

interface ChatStore {
  chats: ChatSession[]
  selectedChatId: string | null
  messages: ChatMessage[]
  selectedAgents: string[]
  mode: 'single' | 'multi'
  addMessage: (msg: ChatMessage) => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
  loadChats: (userId: string) => Promise<void>
  selectChat: (chatId: string) => void
  createNewChat: (userId: string, title?: string) => Promise<void>
  renameChat: (chatId: string, newTitle: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  subscribeToMessages: (conversationId: string) => void
  setSelectedAgents: (agents: string[] | ((prev: string[]) => string[])) => void
  setMode: (mode: 'single' | 'multi') => void
  clearMessages: () => void
  setTyping: (userId: string, isTyping: boolean) => void
  onlineUsers: string[]
  agents: SupabaseAgent[]
  loadAgents: () => Promise<void>
  createAgent: (agent: Omit<SupabaseAgent, 'id'>) => Promise<void>
  updateAgent: (agentId: string, updates: Partial<SupabaseAgent>) => Promise<void>
  deleteAgent: (agentId: string) => Promise<void>
  subscribeToChats: (userId: string) => void
  subscribeToAgents: () => void
}

export const useChatStore = create<ChatStore>((set, get) => {
  let chatSubscription: any = null
  let agentSubscription: any = null

  const subscribeToChats = (userId: string) => {
    if (chatSubscription) chatSubscription.unsubscribe()
    chatSubscription = supabase
      .channel('chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_id=eq.${userId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          set((state) => ({ chats: [payload.new as ChatSession, ...state.chats] }))
        } else if (payload.eventType === 'UPDATE') {
          set((state) => ({ chats: state.chats.map(chat => chat.id === payload.new.id ? (payload.new as ChatSession) : chat) }))
        } else if (payload.eventType === 'DELETE') {
          set((state) => ({ chats: state.chats.filter(chat => chat.id !== payload.old.id) }))
        }
      })
      .subscribe()
  }

  const subscribeToAgents = () => {
    if (agentSubscription) agentSubscription.unsubscribe()
    agentSubscription = supabase
      .channel('agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          set((state) => ({ agents: [...state.agents, payload.new as SupabaseAgent] }))
        } else if (payload.eventType === 'UPDATE') {
          set((state) => ({ agents: state.agents.map(agent => agent.id === payload.new.id ? (payload.new as SupabaseAgent) : agent) }))
        } else if (payload.eventType === 'DELETE') {
          set((state) => ({ agents: state.agents.filter(agent => agent.id !== payload.old.id) }))
        }
      })
      .subscribe()
  }

  return {
    chats: [],
    selectedChatId: null,
    messages: [],
    selectedAgents: [],
    mode: 'single',
    onlineUsers: [],
    agents: [],
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
    loadChats: async (userId) => {
      const { data } = await getUserChats(userId)
      set({ chats: data || [] })
    },
    selectChat: (chatId) => {
      set({ selectedChatId: chatId })
      get().loadMessages(chatId)
    },
    createNewChat: async (userId, title) => {
      const { data } = await createChat(userId, title)
      if (data) {
        set((state) => ({ chats: [data, ...state.chats], selectedChatId: data.id }))
        get().loadMessages(data.id)
      }
    },
    renameChat: async (chatId, newTitle) => {
      await renameChat(chatId, newTitle)
      set((state) => ({
        chats: state.chats.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat)
      }))
    },
    deleteChat: async (chatId) => {
      await deleteChat(chatId)
      set((state) => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        selectedChatId: state.selectedChatId === chatId ? null : state.selectedChatId,
        messages: state.selectedChatId === chatId ? [] : state.messages
      }))
    },
    loadMessages: async (chatId) => {
      const { data, error } = await getChatMessages(chatId)
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
    loadAgents: async () => {
      const { data } = await getAgents()
      set({ agents: data || [] })
    },
    createAgent: async (agent) => {
      const { data } = await supaCreateAgent(agent)
      if (data) set((state) => ({ agents: [...state.agents, data] }))
    },
    updateAgent: async (agentId, updates) => {
      const { data } = await supaUpdateAgent(agentId, updates)
      if (data) set((state) => ({ agents: state.agents.map(a => a.id === agentId ? data : a) }))
    },
    deleteAgent: async (agentId) => {
      await supaDeleteAgent(agentId)
      set((state) => ({ agents: state.agents.filter(a => a.id !== agentId) }))
    },
    subscribeToChats,
    subscribeToAgents,
  }
}) 