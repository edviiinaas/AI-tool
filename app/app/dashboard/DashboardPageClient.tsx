"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/app/dashboard/stat-card"
import { RecentActivityFeed } from "@/components/app/dashboard/recent-activity-feed"
import { AgentUsageChart } from "@/components/app/dashboard/agent-usage-chart"
import { QuickAccessLinks } from "@/components/app/dashboard/quick-access-links"
import { mockDashboardStats } from "@/lib/mock-data"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Briefcase, BarChartBig, Users, FolderKanban } from "lucide-react"

// Import Skeleton Components
import { StatCardSkeleton } from "@/components/app/dashboard/skeletons/stat-card-skeleton"
import { RecentActivitySkeleton } from "@/components/app/dashboard/skeletons/recent-activity-skeleton"
import { AgentUsageChartSkeleton } from "@/components/app/dashboard/skeletons/agent-usage-chart-skeleton"
import { QuickAccessSkeleton } from "@/components/app/dashboard/skeletons/quick-access-skeleton"

export default function DashboardPageClient() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Simulate 1.5 seconds loading time
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-8">
      {isLoading ? (
        <>
          <div>
            <Separator className="mb-8" /> {/* Separator is outside conditional rendering */}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivitySkeleton />
            </div>
            <div className="lg:col-span-1">
              <AgentUsageChartSkeleton />
            </div>
          </div>
          <div>
            <QuickAccessSkeleton />
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-primary-foreground/90">
              Welcome back, {user?.fullName?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground">Here's an overview of your AIConstruct workspace.</p>
          </div>
          <Separator />

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Projects / Chats"
              value={mockDashboardStats.activeProjects}
              icon={Briefcase}
              description="Ongoing conversations & projects"
            />
            <StatCard
              title="Analyses Completed"
              value={mockDashboardStats.analysesCompleted}
              icon={BarChartBig}
              description="Total AI analyses performed"
            />
            <StatCard
              title="Team Members"
              value={mockDashboardStats.teamMembers}
              icon={Users}
              description="Active users in your workspace"
            />
            <StatCard
              title="Knowledge Docs"
              value={mockDashboardStats.knowledgeDocs}
              icon={FolderKanban}
              description="Documents in your knowledge base"
            />
          </div>

          {/* Main Dashboard Layout: Activity Feed and Agent Usage */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivityFeed />
            </div>
            <div className="lg:col-span-1">
              <AgentUsageChart />
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <QuickAccessLinks />
          </div>
        </>
      )}
    </div>
  )
}
