"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { TransactionTable } from "@/components/Dashboard/TransactionTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, ArrowDownRight, ArrowUpRight, Coins, RefreshCw, Search } from "lucide-react"
import { goals, recentTransactions } from "@/lib/mock-data"

export default function ActivityPage() {
  const [goalFilter, setGoalFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter((transaction) => {
      const matchesGoal =
        goalFilter === "all" || transaction.goalName === goalFilter
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter
      const matchesSearch =
        searchQuery === "" ||
        transaction.goalName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMonth =
        monthFilter === "all" ||
        new Date(transaction.date).toLocaleString("default", { month: "long", year: "numeric" }) === monthFilter

      return matchesGoal && matchesType && matchesSearch && matchesMonth
    })
  }, [goalFilter, typeFilter, searchQuery, monthFilter])

  const transactionStats = useMemo(() => {
    const deposits = recentTransactions
      .filter((t) => t.type === "deposit")
      .reduce((acc, t) => acc + t.amount, 0)
    const withdrawals = recentTransactions
      .filter((t) => t.type === "withdrawal")
      .reduce((acc, t) => acc + t.amount, 0)
    const roundUps = recentTransactions
      .filter((t) => t.type === "round-up")
      .reduce((acc, t) => acc + t.amount, 0)
    const transfers = recentTransactions
      .filter((t) => t.type === "transfer")
      .reduce((acc, t) => acc + t.amount, 0)

    return { deposits, withdrawals, roundUps, transfers }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const uniqueGoals = [...new Set(recentTransactions.map((t) => t.goalName))]

  const uniqueMonths = [
    ...new Set(
      recentTransactions.map((t) =>
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
        <div className="grid gap-4 md:grid-cols-4">
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
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transfers</p>
                <p className="text-xl font-bold">
                  +{formatCurrency(transactionStats.transfers)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
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
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
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
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TransactionTable
              transactions={filteredTransactions}
              showUser={true}
            />

            {filteredTransactions.length === 0 && (
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