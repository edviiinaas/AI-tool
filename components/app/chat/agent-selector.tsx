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

const DEFAULT_PRESETS = [
  { name: "Cost Focus", agentIds: ["boq", "price"] },
  { name: "Full Analysis", agentIds: ["boq", "price", "supplier", "advisor", "safety", "schedule"] },
  { name: "Planning Focus", agentIds: ["advisor", "schedule"] },
  { name: "Safety Focus", agentIds: ["safety"] },
]

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every(id => b.includes(id))
}

export function AgentSelector({ isAdmin = false }: { isAdmin?: boolean }) {
  const { user } = useAuth()
  const { agents, loadAgents, createAgent, updateAgent, deleteAgent, selectedAgents, setSelectedAgents, mode, setMode } = useChatStore()
  const [loading, setLoading] = useState(true)
  const [presets, setPresets] = useState<any[]>([])
  const [loadingPresets, setLoadingPresets] = useState(false)

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
      <div className="flex gap-2 items-center mb-2">
        <span className="font-bold">Presets:</span>
        {loadingPresets ? <span>Loading...</span> : presets.length === 0 ? <span className="text-gray-400">No presets</span> : presets.map(preset => (
          <span key={preset.id} className="border rounded px-2 py-1 flex items-center gap-1 cursor-pointer bg-gray-50" onClick={() => setSelectedAgents(preset.agent_ids)}>
            {preset.name}
            <button className="ml-1 text-xs text-red-500" onClick={e => { e.stopPropagation(); handleDeletePreset(preset.id) }}>✕</button>
          </span>
        ))}
        <button className="ml-2 px-2 py-1 border rounded" onClick={handleSavePreset}>+ Save Preset</button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Mode:</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Single</span>
            <Switch
              checked={mode === 'multi'}
              onCheckedChange={(checked) => setMode(checked ? 'multi' : 'single')}
            />
            <span className="text-sm">Multi</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-2 overflow-x-auto">
        {DEFAULT_PRESETS.map(preset => (
          <button
            key={preset.name}
            className={`btn btn-sm whitespace-nowrap ${arraysEqual(selectedAgents, preset.agentIds) ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setSelectedAgents(preset.agentIds)}
          >
            {preset.name}
          </button>
        ))}
        {presets.map(preset => (
          <button
            key={preset.id}
            className={`btn btn-sm whitespace-nowrap ${arraysEqual(selectedAgents, preset.agent_ids) ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setSelectedAgents(preset.agent_ids)}
          >
            {preset.name}
          </button>
        ))}
        <button
          className="btn btn-sm border-dashed whitespace-nowrap"
          onClick={handleSavePreset}
        >
          + Save Current as Preset
        </button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-32 rounded-lg" />)
          ) : agents.length === 0 ? (
            <div className="p-4 text-gray-500">No agents available</div>
          ) : (
            agents.map((agent) => (
              <TooltipProvider key={agent.id || ''}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleAgent(agent.id)}
                      className={cn(
                        "flex flex-col items-center space-y-2 rounded-lg border p-4 transition-colors",
                        selectedAgents.includes(agent.id)
                          ? "ring-2 ring-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-2xl">{agent.emoji || ''}</span>
                      <span className="text-sm font-medium">{agent.name || ''}</span>
                      {isAdmin && (
                        <span className="ml-2">
                          <button onClick={e => { e.stopPropagation(); handleEdit(agent) }}>✏️</button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(agent) }}>🗑️</button>
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{agent.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {isAdmin && !loading && (
        <button className="ml-2 px-2 py-1 border rounded" onClick={handleAdd}>+ Add Agent</button>
      )}
    </div>
  )
} 