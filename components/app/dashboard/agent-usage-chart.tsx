"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { mockAgentUsage } from "@/lib/mock-data"
import { BrainCircuit } from "lucide-react"

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded shadow-lg">
        <p className="label font-semibold">{`${label}`}</p>
        <p className="intro text-sm text-muted-foreground">{`Usage: ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

export function AgentUsageChart({ range = 'month' }: { range?: 'month' | 'week' | 'all' }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Agent Usage</CardTitle>
        <CardDescription>Breakdown of AI agent activity ({range === 'all' ? 'all time' : range}).</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {mockAgentUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAgentUsage} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
              <XAxis
                dataKey="agentName"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="usageCount" radius={[4, 4, 0, 0]}>
                {mockAgentUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <BrainCircuit className="h-12 w-12 mb-4" />
            <p>No agent usage data available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
