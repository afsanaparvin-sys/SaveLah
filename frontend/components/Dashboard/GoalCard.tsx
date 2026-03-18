import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProgressBar } from "./ProgressBar"
import { Calendar, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  id: string
  title: string
  description?: string
  currentAmount: number
  targetAmount: number
  deadline: string
  currency?: string
  className?: string
}

export function GoalCard({
  id,
  title,
  description,
  currentAmount,
  targetAmount,
  deadline,
  currency = "USD",
  className,
}: GoalCardProps) {
  const progress = (currentAmount / targetAmount) * 100
  const remaining = targetAmount - currentAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Link href={`/GoalDetailsPage/${id}`}>
      <Card
        className={cn(
          "group border-0 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
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
            <span className="font-medium text-primary">
              {formatCurrency(remaining)} to go
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
