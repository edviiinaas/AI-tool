"use client"
import { AGENTS } from "@/lib/constants"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StepProps {
  data: { selectedAgentIds: string[] }
  updateData: (data: { selectedAgentIds: string[] }) => void
}

export function AgentSelectionStep({ data, updateData }: StepProps) {
  const handleAgentToggle = (agentId: string) => {
    const newSelectedAgentIds = data.selectedAgentIds.includes(agentId)
      ? data.selectedAgentIds.filter((id) => id !== agentId)
      : [...data.selectedAgentIds, agentId]
    updateData({ selectedAgentIds: newSelectedAgentIds })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-center">Meet Your AI Team</h2>
      <p className="text-muted-foreground text-center">
        Select the AI assistants you'd like to start with. You can always change this later.
      </p>
      <ScrollArea className="h-[240px] rounded-md border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className={`p-3 rounded-lg border flex items-center space-x-3 transition-all cursor-pointer hover:shadow-md ${
                data.selectedAgentIds.includes(agent.id)
                  ? "border-primary ring-2 ring-primary shadow-md"
                  : "border-border"
              }`}
              onClick={() => handleAgentToggle(agent.id)}
            >
              <Checkbox
                id={`agent-${agent.id}`}
                checked={data.selectedAgentIds.includes(agent.id)}
                onCheckedChange={() => handleAgentToggle(agent.id)}
                className="shrink-0"
              />
              <div className="flex-grow">
                <Label htmlFor={`agent-${agent.id}`} className="font-medium flex items-center cursor-pointer">
                  <agent.icon className="h-5 w-5 mr-2" style={{ color: agent.color }} />
                  {agent.name}
                </Label>
                <p className="text-xs text-muted-foreground">{agent.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground text-center pt-2">
        Selected agents:{" "}
        {data.selectedAgentIds.length > 0
          ? data.selectedAgentIds.map((id) => AGENTS.find((a) => a.id === id)?.name).join(", ")
          : "None"}
      </p>
    </div>
  )
}
