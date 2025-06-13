"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  FileText,
  MessageSquare,
  Users2,
  Settings,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Building,
  KeyRound,
  Wand2,
} from "lucide-react"
import { AGENTS } from "@/lib/constants"

const mockConversations = [
  { id: "conv1", title: "Project Titan - VQ Analysis", href: "/app" },
  { id: "conv2", title: "Welcome to AIConstruct!", href: "/app" },
  { id: "conv3", title: "Steel Beam Pricing Inquiry", href: "/app" },
]

const mockKnowledgeArticles = [
  { id: "kb1", title: "EN 1452 PVC Piping Standards", href: "/app/knowledge" },
  { id: "kb2", title: "Q1 2024 Concrete Market Prices", href: "/app/knowledge" },
]

const mockTeamMembers = [
  { id: "team1", name: "John Construct", email: "john@buildcraft.com", href: "/app/team" },
  { id: "team2", name: "Sarah Engineer", email: "sarah.e@buildcraft.com", href: "/app/team" },
]

const navigationLinks = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app", label: "Chat", icon: MessageSquare },
  { href: "/app/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/app/team", label: "Team Management", icon: Users2 },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/agents", label: "Agent Configuration", icon: KeyRound },
  { href: "/app/settings", label: "User Settings", icon: Settings },
]

interface GlobalSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter()

  const runCommand = useCallback(
    (command: () => unknown) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange],
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => alert("Starting product tour..."))} className="cursor-pointer">
            <Wand2 className="mr-2 h-4 w-4" />
            <span>Start Product Tour</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {navigationLinks.map((link) => (
            <CommandItem
              key={link.href}
              value={`Navigate to ${link.label}`}
              onSelect={() => runCommand(() => router.push(link.href))}
              className="cursor-pointer"
            >
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Conversations">
          {mockConversations.map((conv) => (
            <CommandItem
              key={conv.id}
              value={`Conversation: ${conv.title}`}
              onSelect={() => runCommand(() => router.push(`${conv.href}?convId=${conv.id}`))}
              className="cursor-pointer"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>{conv.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Knowledge Base">
          {mockKnowledgeArticles.map((article) => (
            <CommandItem
              key={article.id}
              value={`Document: ${article.title}`}
              onSelect={() => runCommand(() => router.push(`${article.href}?articleId=${article.id}`))}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{article.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Team Members">
          {mockTeamMembers.map((member) => (
            <CommandItem
              key={member.id}
              value={`Team: ${member.name} ${member.email}`}
              onSelect={() => runCommand(() => router.push(member.href))}
              className="cursor-pointer"
            >
              <Users2 className="mr-2 h-4 w-4" />
              <span>{member.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{member.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="AI Agents">
          {AGENTS.map((agent) => (
            <CommandItem
              key={agent.id}
              value={`Agent: ${agent.name} ${agent.description}`}
              onSelect={() => runCommand(() => router.push(`/app/agents?agentId=${agent.id}`))}
              className="cursor-pointer"
            >
              <agent.icon className="mr-2 h-4 w-4" style={{ color: agent.color }} />
              <span>{agent.name}</span>
              <span className="text-xs text-muted-foreground ml-2 truncate">{agent.description}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
