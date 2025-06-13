"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Brain, Thermometer, Zap, AlertTriangle, Save, Settings2 } from "lucide-react"
import type { AgentConfig, KnowledgeDocument } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AgentConfigCardProps {
  agentConfig: AgentConfig
  onSave: (updatedConfig: AgentConfig) => void // Mock save
  allKnowledgeDocs: KnowledgeDocument[] // For selection
  userPlan: "starter" | "pro" | "enterprise"
}

export function AgentConfigCard({ agentConfig, onSave, allKnowledgeDocs, userPlan }: AgentConfigCardProps) {
  const [config, setConfig] = useState<AgentConfig>(agentConfig)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof AgentConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleSliderChange = (field: keyof AgentConfig, value: number[]) => {
    setConfig((prev) => ({ ...prev, [field]: value[0] }))
  }

  const handleSave = () => {
    onSave(config)
    setIsEditing(false)
    toast({
      title: "Agent Settings Saved",
      description: `${config.name}'s configuration has been updated.`,
    })
  }

  const isProFeature = (agentId: AgentConfig["id"]) => {
    // Example: RiskBot and ClosingAI are Pro features
    return ["risk-bot", "closing-ai"].includes(agentId)
  }

  const isLockedByPlan = isProFeature(config.id) && userPlan === "starter"

  return (
    <Card className={cn("flex flex-col", isLockedByPlan && "bg-muted/50 border-dashed")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <config.icon className={cn("h-8 w-8", config.color)} />
            <div>
              <CardTitle className="text-xl">{config.name}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          {isLockedByPlan ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              <Zap className="mr-1.5 h-3.5 w-3.5" /> Pro Feature
            </Badge>
          ) : (
            <Switch
              id={`enable-${config.id}`}
              checked={config.isEnabled}
              onCheckedChange={(checked) => handleInputChange("isEnabled", checked)}
              aria-label={`Enable ${config.name}`}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        {isLockedByPlan && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-center text-sm text-amber-700">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
            This agent is available on the Pro plan.
            <Button variant="link" className="p-0 h-auto ml-1 text-amber-700">
              Upgrade to unlock.
            </Button>
          </div>
        )}

        <div className={cn(isLockedByPlan && "opacity-50 pointer-events-none")}>
          <div>
            <Label htmlFor={`prompt-${config.id}`} className="flex items-center mb-1">
              <Brain className="mr-2 h-4 w-4 text-gray-500" /> Master Prompt
            </Label>
            <Textarea
              id={`prompt-${config.id}`}
              value={config.masterPrompt}
              onChange={(e) => handleInputChange("masterPrompt", e.target.value)}
              rows={4}
              className="text-sm"
              readOnly={!isEditing || isLockedByPlan}
              placeholder={`Define the core role and instructions for ${config.name}...`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor={`style-${config.id}`} className="flex items-center mb-1">
                <Settings2 className="mr-2 h-4 w-4 text-gray-500" /> Response Style
              </Label>
              <Select
                value={config.responseStyle}
                onValueChange={(value) => handleInputChange("responseStyle", value)}
                disabled={!isEditing || isLockedByPlan}
              >
                <SelectTrigger id={`style-${config.id}`}>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`temperature-${config.id}`} className="flex items-center mb-1">
                <Thermometer className="mr-2 h-4 w-4 text-gray-500" /> Temperature: {config.temperature.toFixed(1)}
              </Label>
              <Slider
                id={`temperature-${config.id}`}
                min={0}
                max={1}
                step={0.1}
                defaultValue={[config.temperature]}
                onValueChange={(value) => handleSliderChange("temperature", value)}
                disabled={!isEditing || isLockedByPlan}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`token-${config.id}`} className="flex items-center mb-1">
              <Zap className="mr-2 h-4 w-4 text-gray-500" /> Token Limit (Max per response)
            </Label>
            <Input
              id={`token-${config.id}`}
              type="number"
              value={config.tokenLimit}
              onChange={(e) => handleInputChange("tokenLimit", Number.parseInt(e.target.value) || 0)}
              className="text-sm"
              readOnly={!isEditing || isLockedByPlan}
            />
          </div>

          <div>
            <Label className="flex items-center mb-1">
              <FileText className="mr-2 h-4 w-4 text-gray-500" /> Agent-Specific Knowledge
            </Label>
            {allKnowledgeDocs.length > 0 ? (
              <div className="space-y-2">
                {allKnowledgeDocs.slice(0, 2).map(
                  (
                    doc, // Show a few examples
                  ) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between text-sm p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
                    >
                      <span>
                        {doc.name} ({doc.type}, {doc.size})
                      </span>
                      <Switch
                        checked={config.knowledgeDocumentIds?.includes(doc.id)}
                        onCheckedChange={(checked) => {
                          const currentDocIds = config.knowledgeDocumentIds || []
                          const newDocIds = checked
                            ? [...currentDocIds, doc.id]
                            : currentDocIds.filter((id) => id !== doc.id)
                          handleInputChange("knowledgeDocumentIds", newDocIds)
                        }}
                        disabled={!isEditing || isLockedByPlan}
                      />
                    </div>
                  ),
                )}
                {allKnowledgeDocs.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center">More documents available...</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No knowledge documents uploaded yet.{" "}
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Upload Documents
                </Button>
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-2 w-full" disabled={!isEditing || isLockedByPlan}>
              Manage Agent Knowledge
            </Button>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="py-4">
        {isLockedByPlan ? (
          <Button className="w-full bg-amber-500 hover:bg-amber-600" disabled>
            <Zap className="mr-2 h-4 w-4" /> Upgrade to Pro to Customize
          </Button>
        ) : isEditing ? (
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
            <Settings2 className="mr-2 h-4 w-4" /> Customize Agent
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
