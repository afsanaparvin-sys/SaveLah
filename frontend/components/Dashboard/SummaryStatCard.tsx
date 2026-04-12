import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SubStat {
  label: string
  value: string
  change?: {
    value: string
    positive: boolean
  }
}

interface SummaryStatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  subStats?: SubStat[]
  className?: string
}

export function SummaryStatCard({
  title,
  value,
  icon: Icon,
  trend,
  subStats,
  className,
}: SummaryStatCardProps) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
            {trend && (
              <p className={cn("text-sm font-medium", trend.positive ? "text-success" : "text-destructive")}>
                {trend.positive ? "+" : "-"}{trend.value} from last month
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ml-4 shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>

        {subStats && subStats.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {subStats.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 p-3 space-y-1">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-card-foreground">{s.value}</p>
                {s.change && (
                  <p className={cn("text-xs font-medium", s.change.positive ? "text-success" : "text-destructive")}>
                    {s.change.positive ? "+" : "-"}{s.change.value}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
