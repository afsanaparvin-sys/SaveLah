"use client"

import { use } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { ProgressBar } from "@/components/Dashboard/ProgressBar"
import { TransactionTable } from "@/components/Dashboard/TransactionTable"
import { ContributionTable } from "@/components/Dashboard/ContributionTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Plus,
} from "lucide-react"
import { goals, goalMembers, recentTransactions } from "@/lib/mock-data"

interface GoalDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function GoalDetailsPage({ params }: GoalDetailsPageProps) {
  const { id } = use(params)
  const goal = goals.find((g) => g.id === id)
  const members = goalMembers[id] || []
  const transactions = recentTransactions.filter(
    (t) => t.goalName === goal?.title
  )

  if (!goal) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Goal not found</h1>
          <p className="text-muted-foreground">
            The goal you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/GoalsPage">Back to Goals</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
  const remaining = goal.targetAmount - goal.currentAmount

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Navigation */}
        <Button variant="ghost" asChild className="gap-2 -ml-2">
          <Link href="/GoalsPage">
            <ArrowLeft className="h-4 w-4" />
            Back to Goals
          </Link>
        </Button>

        {/* Goal Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Left side - Goal info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{goal.title}</h1>
                    <p className="text-muted-foreground">{goal.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="bg-success/10 text-success"
                  >
                    Active
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Deadline: {formatDate(goal.deadline)}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Right side - Amount info */}
              <div className="text-right lg:min-w-[200px]">
                <p className="text-sm text-muted-foreground">Current Amount</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(goal.currentAmount, goal.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {formatCurrency(goal.targetAmount, goal.currency)} target
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <ProgressBar
                value={goal.currentAmount}
                max={goal.targetAmount}
                size="lg"
              />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">
                  {formatCurrency(remaining, goal.currency)}
                </span>{" "}
                remaining to reach your goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Average</p>
                <p className="text-xl font-bold">
                  {formatCurrency(goal.currentAmount / 6, goal.currency)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-xl font-bold">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(goal.deadline).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-xl font-bold">{members.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Members Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Goal Members</CardTitle>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              <ContributionTable members={members} />
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <TransactionTable transactions={transactions} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">
                    No transactions yet for this goal.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
