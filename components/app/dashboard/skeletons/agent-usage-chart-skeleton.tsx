import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AgentUsageChartSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-1/2 mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="w-full h-[300px] p-4 space-y-4">
          <Skeleton className="h-full w-full" />
          <div className="flex justify-between">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-10" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
