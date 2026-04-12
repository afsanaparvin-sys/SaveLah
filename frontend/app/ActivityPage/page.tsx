"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { TransactionTable } from "@/components/Dashboard/TransactionTable"
import type { Transaction } from "@/components/Dashboard/TransactionTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, ArrowDownRight, ArrowUpRight, Coins, RefreshCw, Search, Loader2, AlertCircle } from "lucide-react"
import { getLedgerByUserId, type LedgerTransaction } from "@/lib/api"
import { getUserId } from "@/lib/auth"

// map integer enum to Transaction type string
const typeMap: Record<string, Transaction["type"]> = {
  "1": "deposit",    // MerchantPayment
  "2": "round-up",   // RoundingDeposit
  "3": "deposit",    // MonthlyDeposit
  "4": "deposit",    // WeeklyDeposit
  "5": "withdrawal", // Withdrawal
}

export default function ActivityPage() {
  const [rawTransactions, setRawTransactions] = useState<LedgerTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [goalFilter, setGoalFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true)
        setError(null)
        const userId = getUserId()
        const data = await getLedgerByUserId(Number(userId))
        setRawTransactions(data)
      } catch (err) {
        setError("Failed to load transactions.")
      } finally {
        setLoading(false)
      }
    }

    fetchLedger()
  }, [])

  // map ledger data to Transaction shape for TransactionTable
  const transactions: Transaction[] = rawTransactions.map((tx) => ({
    id: String(tx.LedgerId),
    type: typeMap[tx.Type] ?? "transfer",
    goalName: `Goal #${tx.GoalId}`,
    amount: tx.Amount,
    currency: tx.Currency || "SGD",
    date: tx.CreatedOn ?? new Date().toISOString(),
    user: undefined,
  }))

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesGoal = goalFilter === "all" || t.goalName === goalFilter
      const matchesType = typeFilter === "all" || t.type === typeFilter
      const matchesSearch =
        searchQuery === "" ||
        t.goalName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMonth =
        monthFilter === "all" ||
        new Date(t.date).toLocaleString("default", { month: "long", year: "numeric" }) === monthFilter
      return matchesGoal && matchesType && matchesSearch && matchesMonth
    })
  }, [transactions, goalFilter, typeFilter, searchQuery, monthFilter])

  const transactionStats = useMemo(() => {
    const deposits = rawTransactions
      .filter((t) => ["1", "3", "4"].includes(t.Type))
      .reduce((acc, t) => acc + t.Amount, 0)
    const withdrawals = rawTransactions
      .filter((t) => t.Type === "5")
      .reduce((acc, t) => acc + t.Amount, 0)
    const roundUps = rawTransactions
      .filter((t) => t.Type === "2")
      .reduce((acc, t) => acc + t.Amount, 0)
  
    return { deposits, withdrawals, roundUps }
  }, [rawTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    }).format(amount)
  }

  const uniqueGoals = [...new Set(transactions.map((t) => t.goalName))]
  const uniqueMonths = [
    ...new Set(
      transactions.map((t) =>
        new Date(t.date).toLocaleString("default", { month: "long", year: "numeric" })
      )
    ),
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
          <p className="text-muted-foreground">
            View and filter all your savings transactions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ArrowDownRight className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-xl font-bold text-success">
                  +{formatCurrency(transactionStats.deposits)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                <p className="text-xl font-bold text-destructive">
                  -{formatCurrency(transactionStats.withdrawals)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Coins className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Round-Ups</p>
                <p className="text-xl font-bold">
                  +{formatCurrency(transactionStats.roundUps)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters + Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {uniqueMonths.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={goalFilter} onValueChange={setGoalFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  {uniqueGoals.map((goal) => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="round-up">Round-Ups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions...
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <TransactionTable
                transactions={filteredTransactions}
                showUser={false}
              />
            )}

            {!loading && !error && filteredTransactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 font-medium">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}