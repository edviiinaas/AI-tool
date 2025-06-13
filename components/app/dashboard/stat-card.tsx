import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface StatCardProps {
  title: string
  value: ReactNode
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Icon className="h-5 w-5 text-muted-foreground" /></span>
            </TooltipTrigger>
            <TooltipContent>{title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-2xl font-bold text-primary dark:text-primary-foreground/90">{value}</span>
            </TooltipTrigger>
            <TooltipContent>{description || title}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
