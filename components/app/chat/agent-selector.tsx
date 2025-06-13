"use client"

import { useChatStore } from "@/lib/chat-store"
import { AGENTS, AGENT_PRESETS, type AgentPreset } from "@/lib/agents"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function AgentSelector() {
  const { selectedAgents, setSelectedAgents, mode, setMode } = useChatStore()

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

  const selectPreset = (preset: AgentPreset) => {
    setSelectedAgents([...AGENT_PRESETS[preset]])
  }

  return (
    <div className="space-y-4">
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
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Presets:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectPreset('cost-focus')}
          >
            Cost Focus
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectPreset('safety-focus')}
          >
            Safety Focus
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectPreset('planning-focus')}
          >
            Planning Focus
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectPreset('full-analysis')}
          >
            Full Analysis
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4">
          {AGENTS.map((agent) => (
            <TooltipProvider key={agent.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      "flex flex-col items-center space-y-2 rounded-lg border p-4 transition-colors",
                      agent.color,
                      selectedAgents.includes(agent.id)
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="text-2xl">{agent.emoji}</span>
                    <span className="text-sm font-medium">{agent.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{agent.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
} 