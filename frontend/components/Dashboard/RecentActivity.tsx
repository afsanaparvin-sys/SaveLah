"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Coins, ArrowRight, Loader2, AlertCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserId } from "@/lib/auth"

interface LedgerTransaction {
  LedgerId: number
  UserId: number
  GoalId: number
  Type: number        // integer enum
  Amount: number
  Currency: string
  MonthlyTransfersId: number
  PaymentId: number
  BankTransferId: number
  CreatedOn: string
}

const typeConfig: Record<number, { label: string; icon: any; color: string }> = {
  1: { label: "Payment Deposit",  icon: ArrowDownRight, color: "bg-success/10 text-success" },
  2: { label: "Round-Up",         icon: Coins,          color: "bg-accent/10 text-accent" },
  3: { label: "Monthly Deposit",  icon: Calendar,       color: "bg-primary/10 text-primary" },
  4: { label: "Weekly Deposit",   icon: RefreshCw,      color: "bg-primary/10 text-primary" },
  5: { label: "Withdrawal",       icon: ArrowUpRight,   color: "bg-destructive/10 text-destructive" },
}

const getConfig = (type: number) =>
  typeConfig[type] ?? { label: "Unknown", icon: RefreshCw, color: "bg-primary/10 text-primary" }

export function RecentActivity() {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true)
        setError(null)

        const userId = getUserId()
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("auth_token="))
          ?.split("=")[1]

        const res = await fetch(
          `https://personal-s6qgwhkb.outsystemscloud.com/DBEALedger/rest/LedgerNew/GetLedgerTransactionsByUserId?UserId=${userId}`,
          {
            headers: { "Authorization": token ?? "" }
          }
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data: LedgerTransaction[] = await res.json()
        setTransactions(data.slice(0, 5))
      } catch (err) {
        setError("Failed to load recent activity.")
      } finally {
        setLoading(false)
      }
    }

    fetch_()
  }, [])

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
    }).format(Math.abs(amount))

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-SG", { month: "short", day: "numeric" })
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

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading activity...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && transactions.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        )}

        {/* Transactions */}
        {!loading && !error && transactions.map((tx) => {
          const config = getConfig(tx.Type)
          const Icon = config.icon
          const isNegative = tx.Type === 5

          return (
            <div
              key={tx.LedgerId}
              className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Goal #{tx.GoalId}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
                <p className="text-xs text-muted-foreground">{formatDate(tx.CreatedOn)}</p>
              </div>
              <span className={cn("text-sm font-semibold", isNegative ? "text-destructive" : "text-success")}>
                {isNegative ? "-" : "+"}{formatCurrency(tx.Amount, tx.Currency)}
              </span>
            </div>
          )
        })}

      </CardContent>
    </Card>
  )
}