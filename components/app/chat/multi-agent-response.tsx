"use client"

import React from "react"
import { AGENTS } from "@/lib/agents"
import { cn } from "@/lib/utils"
import { RichContent } from "./rich-content"

interface MultiAgentResponseProps {
  messages: any[]
}

export function MultiAgentResponse({ messages }: MultiAgentResponseProps) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) => {
        const agent = AGENTS.find(a => a.id === msg.agentId) || { name: msg.agentId || 'AI', emoji: '🤖', color: 'border-muted' }
        return (
          <div
            key={msg.id}
            className={`border-l-4 pl-4 py-2 bg-background/80 rounded-lg shadow-sm ${agent.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{agent.emoji}</span>
              <span className="font-semibold text-sm">{agent.name}</span>
            </div>
            <div className="prose max-w-none">
              {msg.richContent ? <RichContent content={msg.richContent} /> : <span>{msg.content}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
} 