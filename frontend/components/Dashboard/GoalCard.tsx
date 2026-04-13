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
  myContribution?: number
  myTarget?: number
  className?: string
}

const statusConfig = {
  active: {
    badge: "bg-success/10 text-success",
    label: "Active",
    icon: Target,
    iconClass: "text-success",
    iconBg: "bg-success/10",
    card: "",
    border: "border-l-4 border-l-success",
  },
  completed: {
    badge: "bg-primary/10 text-primary",
    label: "Completed",
    icon: CheckCircle,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
    card: "opacity-90",
    border: "border-l-4 border-l-primary",
  },
  cancelled: {
    badge: "bg-destructive/10 text-destructive",
    label: "Cancelled",
    icon: XCircle,
    iconClass: "text-destructive",
    iconBg: "bg-destructive/10",
    card: "opacity-60",
    border: "border-l-4 border-l-destructive",
  },
  withdrawn: {
    badge: "bg-accent/10 text-accent",
    label: "Completed & Withdrawn",
    icon: CheckCircle,
    iconClass: "text-accent",
    iconBg: "bg-accent/10",
    card: "opacity-90",
    border: "border-l-4 border-l-accent",
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
  myContribution,
  myTarget,
  className,
}: GoalCardProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.active
  const Icon = config.icon
  const remaining = targetAmount - currentAmount
  const isActive = status === "active"

  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isOverdue = isActive && daysLeft < 0

  const myPct = myTarget && myTarget > 0
    ? Math.min(100, Math.round(((myContribution ?? 0) / myTarget) * 100))
    : null

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
        "group shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        config.card,
        config.border,
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
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge variant="secondary" className={cn("text-xs", config.badge)}>
                {config.label}
              </Badge>
              {isActive && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  isOverdue
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}>
                  {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </span>
              )}
            </div>
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
            {!isActive && (
              <span className={cn(
                "font-medium text-sm",
                status === "completed" ? "text-primary" : status === "withdrawn" ? "text-accent" : "text-destructive"
              )}>
                {status === "completed" ? "Goal reached! ✓" : status === "withdrawn" ? "Completed & Withdrawn" : "Cancelled"}
              </span>
            )}
          </div>

          {myPct !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">My contribution</span>
                <span className={cn("font-semibold", myPct >= 100 ? "text-success" : "text-primary")}>
                  {myPct >= 100 ? "✓ " : ""}{formatCurrency(myContribution ?? 0)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", myPct >= 100 ? "bg-success" : "bg-primary")}
                  style={{ width: `${Math.min(myPct, 100)}%` }}
                />
              </div>
              <div className="flex justify-end">
                <span className="text-[10px] text-muted-foreground">{myPct}% of my target</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
