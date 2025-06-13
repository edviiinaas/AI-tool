"use client"
import { useState, useEffect } from "react"
import { AGENTS, DEFAULT_AGENT_CONFIGS, MOCK_KNOWLEDGE_DOCS } from "@/lib/constants"
import type { AgentConfig, KnowledgeDocument } from "@/lib/types"
import { AgentConfigCard } from "@/components/app/agents/agent-config-card"
import { useAuth } from "@/contexts/auth-context" // To get user plan
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Helper to get initial configs, simulating fetching from a backend
const getInitialAgentConfigs = (): AgentConfig[] => {
  // In a real app, this would fetch from DB or use a default set
  // For now, merge AGENTS constant with DEFAULT_AGENT_CONFIGS
  return AGENTS.map((agent) => {
    const defaultConfig = DEFAULT_AGENT_CONFIGS.find(config => config.agentId === agent.id)
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      icon: agent.icon,
      color: agent.color,
      masterPrompt:
        defaultConfig?.masterPrompt ||
        `This is ${agent.name}. I am an AI assistant specialized in ${agent.description.toLowerCase()}.`,
      temperature: defaultConfig?.temperature || 0.5,
      responseStyle: defaultConfig?.responseStyle || "balanced",
      tokenLimit: defaultConfig?.tokenLimit || 2000,
      knowledgeDocumentIds: defaultConfig?.knowledgeDocumentIds || [],
      isEnabled: defaultConfig?.isEnabled !== undefined ? defaultConfig.isEnabled : true,
    }
  })
}

interface ProfileSettingsFormProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    companyName: string;
  };
  onSave: (data: Partial<{
    id: string;
    fullName: string;
    email: string;
    companyName: string;
  }>) => void;
}

export function ProfileSettingsForm({ user, onSave }: ProfileSettingsFormProps) {
  // ...use user and onSave instead of context...
}

interface SettingsTabsProps {
  tabs: { value: string; label: string; component: React.ReactNode }[];
  activeTab: string;
  onTabChange: React.Dispatch<React.SetStateAction<string>>;
}

export function SettingsTabs({ tabs, activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10 mb-6">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} className="py-2 sm:py-0">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function AgentSettingsPageClient() {
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([])
  const [allKnowledgeDocs, setAllKnowledgeDocs] = useState<KnowledgeDocument[]>(MOCK_KNOWLEDGE_DOCS)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth() // Assuming user object has a 'plan' property

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setAgentConfigs(getInitialAgentConfigs())
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveConfig = (updatedConfig: AgentConfig) => {
    setAgentConfigs((prevConfigs) =>
      prevConfigs.map((config) => (config.id === updatedConfig.id ? updatedConfig : config)),
    )
    // In a real app, you'd send this to your backend API
    console.log("Saving updated config:", updatedConfig)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[500px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const userPlan = user?.plan || "starter" // Default to starter if plan not available

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Agent Settings</h1>
        <p className="text-muted-foreground">Customize the behavior and capabilities of your AI agents.</p>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="font-semibold">Fine-Tune Your Agents</AlertTitle>
        <AlertDescription>
          Adjust master prompts, response styles, and temperature to align agents with your specific needs. Link
          knowledge documents to provide them with context for more accurate responses. Changes are saved per agent and
          will apply to new conversations.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentConfigs.map((config) => (
          <AgentConfigCard
            key={config.id}
            agentConfig={config}
            onSave={handleSaveConfig}
            allKnowledgeDocs={allKnowledgeDocs}
            userPlan={userPlan}
          />
        ))}
      </div>
    </div>
  )
}
