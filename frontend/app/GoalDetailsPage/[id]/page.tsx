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
import { getGoal, getLedgerByUserId, deleteGoal, withdrawGoal, type GoalMember, type LedgerTransaction } from "@/lib/api"
import { getUserId } from "@/lib/auth"
import { ContributeModal } from "@/components/Goals/ContributeModal"
import { useSavings } from "@/lib/SavingsContext"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, Banknote, Loader2 } from "lucide-react"

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
  ownerId: number
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
  const router = useRouter()
  const { refreshSavings } = useSavings()

  const [goal, setGoal] = useState<PageGoal | null>(
    mockGoal ? { ...mockGoal, ownerId: 0, isMock: true, withdrawalType: null, createdAt: null } : null
  )
  const [members, setMembers] = useState<PageMember[]>(
    mockGoal
      ? (goalMembers[id] || []).map((m: { id: string; name: string; contributionTarget: number; currentContribution: number; currency: string }) => ({ ...m, userId: 0 }))
      : []
  )
  const [loading, setLoading] = useState(!mockGoal)
  const [error, setError] = useState(false)
  const [contributeOpen, setContributeOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [ledger, setLedger] = useState<LedgerTransaction[]>([])

  const loadGoal = () => {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) { setError(true); return }
    getLedgerByUserId(currentUserId)
      .then((txs) => setLedger(txs.filter((t) => t.GoalId === numericId)))
      .catch(() => {})
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
          status: Goal.Status === 1 ? "active" : Goal.Status === 2 ? "completed" : Goal.Status === 3 ? "cancelled" : "withdrawn",
          ownerId: Goal.OwnerId,
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
  }

  useEffect(() => {
    if (mockGoal) return
    loadGoal()
  }, [id])

  const typeMap: Record<string, "deposit" | "round-up" | "monthly-deposit" | "weekly-deposit" | "withdrawal" | "transfer"> = {
    "1": "deposit",
    "2": "round-up",
    "3": "monthly-deposit",
    "4": "weekly-deposit",
    "5": "withdrawal",
  }

  const transactions = goal?.isMock
    ? recentTransactions.filter((t) => t.goalName === goal?.title)
    : ledger.map((t) => ({
        id: String(t.LedgerId),
        type: typeMap[t.Type] ?? "transfer",
        goalName: goal?.title ?? "",
        amount: t.Amount,
        currency: t.Currency || goal?.currency || "SGD",
        date: t.CreatedOn,
      }))

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
                        : goal.status === "completed" || goal.status === "withdrawn"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }
                  >
                    {goal.status === "active" ? "Active" : goal.status === "completed" ? "Completed" : goal.status === "withdrawn" ? "Completed & Withdrawn" : "Cancelled"}
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
                <div className="flex justify-end gap-2 mt-3">
                  {myMember && goal.status === "active" && myMember.contributionTarget > myMember.currentContribution && (
                    <Button onClick={() => setContributeOpen(true)}>
                      Contribute
                    </Button>
                  )}
                  {!goal.isMock && goal.ownerId === currentUserId && (
                    <>
                      {/* Withdraw Button */}
                      <AlertDialog open={withdrawSuccess} onOpenChange={setWithdrawSuccess}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Funds Disbursed 🎉</AlertDialogTitle>
                            <AlertDialogDescription>
                              {goal.withdrawalType === 2
                                ? "The funds have been disbursed and split proportionally to each member's bank account based on their contributions."
                                : "The funds have been disbursed in full to the goal owner's bank account."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction onClick={() => router.push("/GoalsPage")}>
                              Done
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* Withdraw confirmation dialog */}
                      <Dialog open={withdrawConfirmOpen} onOpenChange={(o) => { if (!withdrawLoading) setWithdrawConfirmOpen(o) }}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {goal.status === "active" ? "Cancel goal and withdraw funds?" : "Withdraw funds now?"}
                            </DialogTitle>
                            <DialogDescription>
                              {goal.status === "active"
                                ? `This will cancel the goal "${goal.title}" and disburse all funds (${formatCurrency(goal.currentAmount, goal.currency)}) to ${goal.withdrawalType === 2 ? "each member based on their contributions" : "the goal owner"}. This cannot be undone.`
                                : `This will withdraw all funds (${formatCurrency(goal.currentAmount, goal.currency)}) from "${goal.title}" to ${goal.withdrawalType === 2 ? "each member based on their contributions" : "the goal owner"}. This cannot be undone.`}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setWithdrawConfirmOpen(false)} disabled={withdrawLoading}>
                              Cancel
                            </Button>
                            <Button
                              variant={goal.status === "active" ? "destructive" : "default"}
                              disabled={withdrawLoading}
                              onClick={async () => {
                                setWithdrawLoading(true)
                                try {
                                  await withdrawGoal(parseInt(id, 10))
                                  refreshSavings()
                                  setWithdrawConfirmOpen(false)
                                  setWithdrawSuccess(true)
                                } catch {
                                  toast.error("Failed to process withdrawal.")
                                } finally {
                                  setWithdrawLoading(false)
                                }
                              }}
                            >
                              {withdrawLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</> : "Confirm"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <Button
                              variant={goal.status === "active" ? "destructive" : "default"}
                              disabled={goal.status !== "active" && goal.status !== "completed"}
                              className="gap-2"
                              onClick={() => setWithdrawConfirmOpen(true)}
                            >
                              <Banknote className="h-4 w-4" />
                              {goal.status === "active" ? "Cancel & Withdraw Funds" : "Withdraw Funds Now!"}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {goal.status !== "active" && goal.status !== "completed" && (
                          <TooltipContent>
                            Withdrawal is only available for active or completed goals
                          </TooltipContent>
                        )}
                      </Tooltip>
                      {/* Delete Button */}
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  disabled={goal.status !== "active" || goal.currentAmount !== 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </span>
                          </TooltipTrigger>
                          {(goal.status !== "active" || goal.currentAmount !== 0) && (
                            <TooltipContent>
                              Goals can only be deleted if they are active and have no contributions
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete <strong>{goal.title}</strong>. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={async () => {
                                setDeleteLoading(true)
                                try {
                                  await deleteGoal(parseInt(id, 10))
                                  toast.success("Goal deleted.")
                                  router.push("/GoalsPage")
                                } catch {
                                  toast.error("Failed to delete goal.")
                                } finally {
                                  setDeleteLoading(false)
                                }
                              }}
                            >
                              {deleteLoading ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
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

            {/* My Contribution */}
            {myMember && (
              <div className="mt-5 rounded-xl bg-muted/40 border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">My Contribution</span>
                    <span className="text-xs text-muted-foreground">{myProgress}%</span>
                  </div>
                  <ProgressBar value={myMember.currentContribution} max={myMember.contributionTarget} size="sm" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      <span className="font-semibold text-foreground">{formatCurrency(myMember.currentContribution, goal.currency)}</span>
                      {" of "}{formatCurrency(myMember.contributionTarget, goal.currency)}
                    </span>
                    {myMember.contributionTarget > myMember.currentContribution ? (
                      <span>{formatCurrency(myMember.contributionTarget - myMember.currentContribution, goal.currency)} left</span>
                    ) : (
                      <span className="text-success font-medium">Target reached ✓</span>
                    )}
                  </div>
                </div>
              </div>
            )}
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
              <CardTitle className="text-lg">Your Contribution History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <TransactionTable transactions={transactions} />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">
                    No contributions yet for this goal.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {myMember && (
        <ContributeModal
          open={contributeOpen}
          onOpenChange={setContributeOpen}
          goalId={parseInt(id, 10)}
          currency={goal.currency}
          maxAmount={Math.max(0, myMember.contributionTarget - myMember.currentContribution)}
          onSuccess={loadGoal}
        />
      )}
    </DashboardLayout>
  )
}
