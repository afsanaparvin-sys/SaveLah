import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "./ProgressBar"
import { Calendar, Target, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  id: string
  title: string
  description?: string
  currentAmount: number
  targetAmount: number
  deadline: string
  currency?: string
  status?: string
  className?: string
}

const statusConfig = {
  active: {
    badge: "bg-success/10 text-success",
    label: "Active",
    icon: Target,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
    card: "",
  },
  completed: {
    badge: "bg-primary/10 text-primary",
    label: "Completed",
    icon: CheckCircle,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
    card: "opacity-80",
  },
  cancelled: {
    badge: "bg-destructive/10 text-destructive",
    label: "Cancelled",
    icon: XCircle,
    iconClass: "text-destructive",
    iconBg: "bg-destructive/10",
    card: "opacity-60",
  },
}

export function GoalCard({
  id,
  title,
  description,
  currentAmount,
  targetAmount,
  deadline,
  currency = "SGD",
  status = "active",
  className,
}: GoalCardProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.active
  const Icon = config.icon
  const remaining = targetAmount - currentAmount
  const isActive = status === "active"

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })

  return (
    <Link href={`/GoalDetailsPage/${id}`}>
      <Card className={cn(
        "group border-0 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        config.card,
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.iconBg)}>
                <Icon className={cn("h-5 w-5", config.iconClass)} />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className={cn("text-xs shrink-0", config.badge)}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-card-foreground">
              {formatCurrency(currentAmount)}
            </span>
            <span className="text-sm text-muted-foreground">
              of {formatCurrency(targetAmount)}
            </span>
          </div>

          <ProgressBar value={currentAmount} max={targetAmount} size="md" />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(deadline)}</span>
            </div>
            {isActive ? (
              <span className="font-medium text-primary">{formatCurrency(remaining)} to go</span>
            ) : (
              <span className="font-medium text-muted-foreground">
                {status === "completed" ? "Goal reached!" : "Cancelled"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
