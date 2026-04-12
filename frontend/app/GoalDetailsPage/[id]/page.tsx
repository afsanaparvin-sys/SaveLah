"use client"

import { use, useEffect, useState } from "react"
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
  User,
  Clock,
  DollarSign,
  Landmark,
} from "lucide-react"
import { goals as mockGoals, goalMembers, recentTransactions } from "@/lib/mock-data"
import { getGoal, type GoalMember } from "@/lib/api"
import { getUserId } from "@/lib/auth"

interface GoalDetailsPageProps {
  params: Promise<{ id: string }>
}

interface PageGoal {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  currency: string
  status: string
  withdrawalType: number | null
  createdAt: string | null
  isMock: boolean
}

interface PageMember {
  id: string
  name: string
  userId: number
  contributionTarget: number
  currentContribution: number
  currency: string
}

export default function GoalDetailsPage({ params }: GoalDetailsPageProps) {
  const { id } = use(params)

  const mockGoal = mockGoals.find((g) => g.id === id)
  const currentUserId = parseInt(getUserId(), 10)

  const [goal, setGoal] = useState<PageGoal | null>(
    mockGoal ? { ...mockGoal, isMock: true, withdrawalType: null, createdAt: null } : null
  )
  const [members, setMembers] = useState<PageMember[]>(
    mockGoal
      ? (goalMembers[id] || []).map((m: { id: string; name: string; contributionTarget: number; currentContribution: number; currency: string }) => ({ ...m, userId: 0 }))
      : []
  )
  const [loading, setLoading] = useState(!mockGoal)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (mockGoal) return

    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      setError(true)
      return
    }

    getGoal(numericId)
      .then(({ Goal, Members }) => {
        setGoal({
          id: String(Goal.Id),
          title: Goal.Title,
          description: Goal.Description,
          targetAmount: Goal.TargetAmount,
          currentAmount: Goal.CurrentAmount ?? 0,
          deadline: Goal.Deadline,
          currency: Goal.Currency,
          status: Goal.Status === 1 ? "active" : Goal.Status === 2 ? "completed" : "cancelled",
          withdrawalType: Goal.WithdrawalType ?? null,
          createdAt: Goal.CreatedAt ?? null,
          isMock: false,
        })
        setMembers(
          Members.map((m: GoalMember) => ({
            id: String(m.Id),
            name: m.Name || `User ${m.UserId}`,
            userId: m.UserId,
            contributionTarget: m.TargetAmount ?? 0,
            currentContribution: m.CurrentAmount ?? 0,
            currency: Goal.Currency,
          }))
        )
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const transactions = goal?.isMock
    ? recentTransactions.filter((t) => t.goalName === goal?.title)
    : []

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Loading goal...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !goal) {
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

  const progress = goal.targetAmount > 0
    ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
    : 0
  const remaining = goal.targetAmount - goal.currentAmount

  // My contribution — find the member row matching the logged-in user
  const myMember = members.find((m) => m.userId === currentUserId)
  const myProgress = myMember && myMember.contributionTarget > 0
    ? Math.round((myMember.currentContribution / myMember.contributionTarget) * 100)
    : 0

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
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{goal.title}</h1>
                      {goal.isMock && (
                        <Badge variant="outline" className="text-[10px] px-1.5 border-amber-400 text-amber-600">
                          Mock
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{goal.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Badge
                    variant="secondary"
                    className={
                      goal.status === "active"
                        ? "bg-success/10 text-success"
                        : goal.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {goal.status === "active" ? "Active" : goal.status === "completed" ? "Completed" : "Cancelled"}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Deadline: {formatDate(goal.deadline)}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    {goal.currency}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Landmark className="h-4 w-4" />
                    {goal.withdrawalType === 1 ? "Host-Only" : goal.withdrawalType === 2 ? "Split" : "—"}
                  </div>
                  {goal.createdAt && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Created {new Date(goal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
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

            {/* Total Goal Progress */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <ProgressBar value={goal.currentAmount} max={goal.targetAmount} size="lg" />
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
          {/* My Contribution */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">My Contribution</p>
              </div>
              {myMember ? (
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <p className="text-xl font-bold">
                      {formatCurrency(myMember.currentContribution, goal.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {formatCurrency(myMember.contributionTarget, goal.currency)}
                    </p>
                  </div>
                  <ProgressBar
                    value={myMember.currentContribution}
                    max={myMember.contributionTarget}
                    size="sm"
                  />
                  <p className="text-xs text-muted-foreground">{myProgress}% of my target</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No contribution record found</p>
              )}
            </CardContent>
          </Card>

          {/* Days Remaining */}
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

          {/* Contributors */}
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
          {/* Members Table — no Add Member button */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Goal Members</CardTitle>
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
