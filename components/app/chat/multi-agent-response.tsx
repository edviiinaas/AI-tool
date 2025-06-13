"use client"

import React from "react"
import { AGENTS } from "@/lib/agents"
import { cn } from "@/lib/utils"
import { RichContent } from "./rich-content"

interface MultiAgentResponseProps {
  messages: any[]
  agentLoadingMap?: Record<string, boolean>
}

const AGENT_COLORS = {
  boq: "border-blue-500 bg-blue-50",
  price: "border-green-500 bg-green-50",
  supplier: "border-yellow-500 bg-yellow-50",
  advisor: "border-purple-500 bg-purple-50",
  safety: "border-orange-500 bg-orange-50",
  schedule: "border-pink-500 bg-pink-50",
}
const AGENT_EMOJIS = {
  boq: "📊",
  price: "📈",
  supplier: "🔍",
  advisor: "🎯",
  safety: "🦺",
  schedule: "📅",
}
const AGENT_NAMES = {
  boq: "BOQ Analyzer",
  price: "Price Prophet",
  supplier: "Supplier Scout",
  advisor: "Project Advisor",
  safety: "Safety Inspector",
  schedule: "Schedule Optimizer",
}

export function MultiAgentResponse({ messages, agentLoadingMap = {} }: MultiAgentResponseProps) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const agentId = msg.agentId as keyof typeof AGENT_NAMES
        return (
          <div
            key={msg.id}
            className={`border-l-4 p-4 rounded shadow-sm animate-fade-in ${AGENT_COLORS[agentId] || "border-gray-300 bg-gray-50"}`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{AGENT_EMOJIS[agentId]}</span>
              <span className="font-bold">{AGENT_NAMES[agentId]}</span>
              {agentLoadingMap[agentId] && (
                <span className="ml-2 text-xs text-blue-500 animate-pulse">Thinking…</span>
              )}
            </div>
            {Array.isArray(msg.referencedAgentIds) && msg.referencedAgentIds.length > 0 && (
              <div className="mb-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
                References: {msg.referencedAgentIds.map((id: string) => (
                  <span key={id} className="font-semibold mr-1">{AGENT_NAMES[id as keyof typeof AGENT_NAMES]}</span>
                ))}
              </div>
            )}
            <div className="prose max-w-none">
              {msg.richContent ? <RichContent content={msg.richContent} /> : <span>{msg.content}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
} 