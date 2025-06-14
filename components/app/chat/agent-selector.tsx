"use client"

import { useChatStore } from "@/lib/chat-store"
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { getAgentPresets, createAgentPreset, deleteAgentPreset } from '@/lib/supabaseAgentPresets'
import { useAuth } from '@/contexts/auth-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const DEFAULT_PRESETS = [
  { name: "Cost Focus", agentIds: ["boq", "price"] },
  { name: "Full Analysis", agentIds: ["boq", "price", "supplier", "advisor", "safety", "schedule"] },
  { name: "Planning Focus", agentIds: ["advisor", "schedule"] },
  { name: "Safety Focus", agentIds: ["safety"] },
]

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every(id => b.includes(id))
}

export function AgentSelector({ isAdmin = false, onAgentSettings }: { isAdmin?: boolean, onAgentSettings?: (agent: any) => void }) {
  const { user } = useAuth()
  const { agents, loadAgents, createAgent, updateAgent, deleteAgent, selectedAgents, setSelectedAgents, mode, setMode } = useChatStore()
  const [loading, setLoading] = useState(true)
  const [presets, setPresets] = useState<any[]>([])
  const [loadingPresets, setLoadingPresets] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    loadAgents().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) {
      setLoadingPresets(true)
      getAgentPresets(user.id).then(({ data }) => {
        setPresets(data || [])
        setLoadingPresets(false)
      })
    }
  }, [user])

  const toggleAgent = (agentId: string) => {
    if (mode === 'single') {
      setSelectedAgents([agentId])
    } else {
      setSelectedAgents((prev: string[]) => 
        prev.includes(agentId)
          ? prev.filter((id: string) => id !== agentId)
          : [...prev, agentId]
      )
    }
  }

  const handleAdd = async () => {
    const name = prompt('Agent name:');
    const emoji = prompt('Agent emoji:');
    let description = prompt('Description:');
    const system_prompt = prompt('System prompt:');
    if (name && emoji && system_prompt) {
      try {
        await createAgent({ name, emoji, description: description || '', system_prompt })
        toast.success('Agent added')
      } catch {
        toast.error('Failed to add agent')
      }
    }
  }

  const handleEdit = async (agent: any) => {
    const newName = prompt('Edit agent name:', agent.name);
    if (newName) {
      try {
        await updateAgent(agent.id, { name: newName })
        toast.success('Agent updated')
      } catch {
        toast.error('Failed to update agent')
      }
    }
  }

  const handleDelete = async (agent: any) => {
    if (window.confirm('Delete this agent?')) {
      try {
        await deleteAgent(agent.id)
        toast.success('Agent deleted')
      } catch {
        toast.error('Failed to delete agent')
      }
    }
  }

  const handleSavePreset = async () => {
    const name = prompt('Preset name:')
    if (name && user) {
      await createAgentPreset(user.id, name, selectedAgents)
      const { data } = await getAgentPresets(user.id)
      setPresets(data || [])
    }
  }

  const handleDeletePreset = async (id: string) => {
    if (window.confirm('Delete this preset?')) {
      await deleteAgentPreset(id)
      setPresets(presets.filter(p => p.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold">Agents:</span>
        <button
          className="ml-2 px-2 py-1 border rounded text-xs text-gray-500 hover:text-primary"
          onClick={() => setSelectedAgents([])}
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
        {agents.map((agent) => (
          <TooltipProvider key={agent.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                    selectedAgents.includes(agent.id)
                      ? "bg-primary text-white border-primary shadow"
                      : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                  )}
                  style={{ minWidth: 72 }}
                >
                  <span className="text-2xl mb-1">{agent.emoji}</span>
                  <span className="text-xs font-medium truncate max-w-[60px]">{agent.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm font-bold mb-1">{agent.name}</div>
                <div className="text-xs text-gray-500 max-w-xs">{agent.description}</div>
                {onAgentSettings && (
                  <button
                    className="mt-2 px-2 py-1 border rounded text-xs text-blue-600 hover:bg-blue-50"
                    onClick={() => onAgentSettings(agent)}
                  >
                    Settings
                  </button>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
} 