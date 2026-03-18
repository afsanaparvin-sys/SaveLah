"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/Dashboard/ProgressBar"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  status: string
  currency: string
}

interface GoalsTableProps {
  goals: Goal[]
  className?: string
}

export function GoalsTable({ goals, className }: GoalsTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Active", className: "bg-success/10 text-success" },
      completed: { label: "Completed", className: "bg-primary/10 text-primary" },
      paused: { label: "Paused", className: "bg-warning/10 text-warning-foreground" },
    }[status] || { label: status, className: "" }

    return (
      <Badge variant="secondary" className={cn("font-medium", config.className)}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Goal</TableHead>
            <TableHead className="font-semibold">Target</TableHead>
            <TableHead className="font-semibold">Current</TableHead>
            <TableHead className="font-semibold">Deadline</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Progress</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => {
            const progress = Math.round(
              (goal.currentAmount / goal.targetAmount) * 100
            )

            return (
              <TableRow
                key={goal.id}
                className="group cursor-pointer hover:bg-muted/30"
              >
                <TableCell>
                  <Link href={`/GoalDetailsPage/${goal.id}`} className="block">
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {goal.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {goal.description}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(goal.targetAmount, goal.currency)}
                </TableCell>
                <TableCell className="text-primary font-medium">
                  {formatCurrency(goal.currentAmount, goal.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(goal.deadline)}
                </TableCell>
                <TableCell>{getStatusBadge(goal.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProgressBar
                      value={goal.currentAmount}
                      max={goal.targetAmount}
                      size="sm"
                      className="w-20"
                    />
                    <span className="text-sm font-medium text-muted-foreground w-10">
                      {progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/GoalDetailsPage/${goal.id}`}>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
