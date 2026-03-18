"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Coins, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Transaction } from "./transaction-table"

interface RecentActivityProps {
  transactions: Transaction[]
}

const typeConfig = {
  deposit: {
    icon: ArrowDownRight,
    color: "bg-success/10 text-success",
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: "bg-destructive/10 text-destructive",
  },
  "round-up": {
    icon: Coins,
    color: "bg-accent/10 text-accent",
  },
  transfer: {
    icon: RefreshCw,
    color: "bg-primary/10 text-primary",
  },
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activity" className="gap-1 text-primary">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.slice(0, 5).map((transaction) => {
          const config = typeConfig[transaction.type]
          const Icon = config.icon
          const isNegative = transaction.type === "withdrawal"

          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  config.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{transaction.goalName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isNegative ? "text-destructive" : "text-success"
                )}
              >
                {isNegative ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
