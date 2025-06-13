"use client"

import { useState, useEffect, useRef } from "react"
import { StatCard } from "@/components/app/dashboard/stat-card"
import { RecentActivityFeed } from "@/components/app/dashboard/recent-activity-feed"
import { AgentUsageChart } from "@/components/app/dashboard/agent-usage-chart"
import { QuickAccessLinks } from "@/components/app/dashboard/quick-access-links"
import { useAuth } from "@/contexts/auth-context"
import { Briefcase, BarChartBig, Users, FolderKanban, Plus, UploadCloud, UserPlus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

// Import Skeleton Components
import { StatCardSkeleton } from "@/components/app/dashboard/skeletons/stat-card-skeleton"
import { RecentActivitySkeleton } from "@/components/app/dashboard/skeletons/recent-activity-skeleton"
import { AgentUsageChartSkeleton } from "@/components/app/dashboard/skeletons/agent-usage-chart-skeleton"
import { QuickAccessSkeleton } from "@/components/app/dashboard/skeletons/quick-access-skeleton"

export default function DashboardPageClient() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    analysesCompleted: 0,
    teamMembers: 0,
    knowledgeDocs: 0,
  })
  const [usageRange, setUsageRange] = useState<'month' | 'week' | 'all'>('month')
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    // Fetch all stats in parallel, filtered by user
    Promise.all([
      // 1. Active Projects/Chats
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      // 2. Analyses Completed
      supabase.from("analyses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      // 3. Team Members (if you have a workspace, filter by workspace_id)
      supabase.from("users").select("id", { count: "exact", head: true }), // No user_id filter for users table
      // 4. Knowledge Docs
      supabase.from("knowledge").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then((results) => {
      setStats({
        activeProjects: results[0].count ?? 0,
        analysesCompleted: results[1].count ?? 0,
        teamMembers: results[2].count ?? 0,
        knowledgeDocs: results[3].count ?? 0,
      })
      setIsLoading(false)
    })
  }, [user])

  return (
    <div data-tour="dashboard" ref={mainRef} className="space-y-4 px-1 sm:px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary dark:text-primary-foreground/90 mb-1">
            Welcome back, {user?.fullName?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground text-sm">Here's an overview of your AIConstruct workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
          <Button variant="default" size="lg" className="gap-1 flex-1 min-w-[120px]"> <Plus className="h-4 w-4" /> New Project</Button>
          <Button variant="outline" size="lg" className="gap-1 flex-1 min-w-[120px]"> <UploadCloud className="h-4 w-4" /> Upload Doc</Button>
          <Button variant="outline" size="lg" className="gap-1 flex-1 min-w-[120px]"> <UserPlus className="h-4 w-4" /> Invite</Button>
        </div>
      </div>
      <Separator className="mb-2" />
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Projects / Chats", value: stats.activeProjects, icon: Briefcase, description: "Ongoing conversations & projects" },
          { title: "Analyses Completed", value: stats.analysesCompleted, icon: BarChartBig, description: "Total AI analyses performed" },
          { title: "Team Members", value: stats.teamMembers, icon: Users, description: "Active users in your workspace" },
          { title: "Knowledge Docs", value: stats.knowledgeDocs, icon: FolderKanban, description: "Documents in your knowledge base" },
        ].map((card, i) => (
          <motion.div key={card.title} whileHover={{ scale: 1.03, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <StatCard
              title={card.title}
              value={<AnimatedCounter value={card.value} />}
              icon={card.icon}
              description={card.description}
              className="transition-all duration-200"
            />
          </motion.div>
        ))}
      </div>
      {/* Main Dashboard Layout: Activity Feed and Agent Usage */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 min-w-0">
          <RecentActivityFeed />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">AI Agent Usage</span>
            <div className="flex gap-1">
              {(['month','week','all'] as const).map(r => (
                <Button key={r} size="sm" variant={usageRange===r?"default":"ghost"} onClick={()=>setUsageRange(r)}>{r.charAt(0).toUpperCase()+r.slice(1)}</Button>
              ))}
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <AgentUsageChart range={usageRange} />
          </div>
        </div>
      </div>
      {/* Quick Access */}
      <div className="mt-2">
        <QuickAccessLinks />
      </div>
    </div>
  )
}

// AnimatedCounter component
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = display
    let end = value
    if (start === end) return
    let raf: number
    const step = () => {
      start += Math.ceil((end - start) / 8)
      if ((end > display && start >= end) || (end < display && start <= end)) {
        setDisplay(end)
        return
      }
      setDisplay(start)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span>{display}</span>
}
