import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

const AGENT_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#a21caf", "#f97316", "#ec4899"]
const AGENT_LABELS = ["BOQ Analyzer", "Price Prophet", "Supplier Scout", "Project Advisor", "Safety Inspector", "Schedule Optimizer"]
const AGENT_IDS = ["boq", "price", "supplier", "advisor", "safety", "schedule"]

export function AnalyticsDashboard() {
  const [messageStats, setMessageStats] = useState<{
    total: number;
    byAgent: Record<string, number>;
    byDay: Record<string, number>;
    users: number;
  }>({ total: 0, byAgent: {}, byDay: {}, users: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      // Fetch messages
      const { data: messages } = await supabase.from("messages").select("*, sender")
      // Fetch users
      const { data: users } = await supabase.from("users").select("id")
      // Aggregate
      const byAgent: Record<string, number> = {}
      const byDay: Record<string, number> = {}
      (messages || []).forEach((msg: any) => {
        if (msg.sender && AGENT_IDS.includes(msg.sender)) {
          byAgent[msg.sender] = (byAgent[msg.sender] || 0) + 1
        }
        const day = msg.created_at?.slice(0, 10)
        if (day) byDay[day] = (byDay[day] || 0) + 1
      })
      setMessageStats({
        total: (messages || []).length,
        byAgent,
        byDay,
        users: (users || []).length
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const agentPieData = AGENT_IDS.map((id, i) => ({
    name: AGENT_LABELS[i],
    value: messageStats.byAgent[id] || 0
  }))
  const dayBarData = Object.entries(messageStats.byDay).map(([day, count]) => ({ day, count }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Chat Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-bold">{loading ? "..." : messageStats.total} messages</div>
            <div className="text-lg">{loading ? "..." : messageStats.users} users</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Agent Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={agentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {agentPieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={AGENT_COLORS[i % AGENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Message Volume Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dayBarData}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 