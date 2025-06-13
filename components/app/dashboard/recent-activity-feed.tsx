"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockRecentActivity } from "@/lib/mock-data"
import { MessageSquare, UploadCloud, BarChart2, UserPlus, BrainCircuit } from "lucide-react"
import { AGENTS } from "@/lib/constants" // To get agent icons/colors

const activityIcons = {
  chat_started: MessageSquare,
  doc_analyzed: BrainCircuit, // Using BrainCircuit for AI analysis
  kb_upload: UploadCloud,
  price_update: BarChart2,
  user_invited: UserPlus,
  default: MessageSquare,
}

const getAgentDetails = (userName: string) => {
  if (userName.endsWith("(AI)")) {
    const agentName = userName.replace(" (AI)", "")
    return AGENTS.find((agent) => agent.name === agentName)
  }
  return null
}

export function RecentActivityFeed() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Overview of the latest actions in your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {mockRecentActivity.length > 0 ? (
          <ScrollArea className="h-[300px] sm:h-[350px] pr-3">
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => {
                const Icon = activityIcons[activity.type as keyof typeof activityIcons] || activityIcons.default
                const agent = getAgentDetails(activity.user)
                const userInitial = agent ? agent.name.charAt(0) : activity.user.charAt(0)
                const avatarColor = agent ? agent.themeColor : undefined

                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="h-9 w-9 border">
                      {agent ? (
                        <agent.avatar className="h-full w-full p-1.5" style={{ color: avatarColor }} />
                      ) : (
                        <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.description.replace(activity.user, "").trim()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(activity.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  )
}
