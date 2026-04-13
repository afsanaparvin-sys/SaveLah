"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { GoalCard } from "@/components/Dashboard/GoalCard"
import { CreateGoalModal } from "@/components/Goals/CreateGoalModal"
import { Button } from "@/components/ui/button"
import { Plus, Target, ChevronDown, ChevronRight, Wallet } from "lucide-react"
import { getAllGoalsByUser } from "@/lib/api"
import { getUserId } from "@/lib/auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface GoalRow {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  status: string
  currency: string
  myContribution: number
  myTarget: number
  isMock?: boolean
}

export default function GoalsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [goalsList, setGoalsList] = useState<GoalRow[]>([])
  const [loadingGoals, setLoadingGoals] = useState(true)

  useEffect(() => {
    const userId = parseInt(getUserId(), 10)
    if (!userId) {
      setLoadingGoals(false)
      return
    }

    getAllGoalsByUser(userId)
      .then((records) => {
        setGoalsList(
          records.map(({ SavingsGoal: g, GoalContributions: c }) => ({
            id: String(g.Id),
            title: g.Title,
            description: g.Description,
            targetAmount: g.TargetAmount,
            currentAmount: g.CurrentAmount ?? 0,
            deadline: g.Deadline,
            status: g.Status === 1 ? "active" : g.Status === 2 ? "completed" : g.Status === 3 ? "cancelled" : "withdrawn",
            currency: g.Currency,
            myContribution: c?.CurrentAmount ?? 0,
            myTarget: c?.TargetAmount ?? 0,
            isMock: false,
          }))
        )
      })
      .catch(() => toast.error("Failed to load goals."))
      .finally(() => setLoadingGoals(false))
  }, [])

  const handleGoalCreated = async () => {
    const userId = parseInt(getUserId(), 10)
    if (!userId) return
    try {
      const records = await getAllGoalsByUser(userId)
      setGoalsList(
        records.map(({ SavingsGoal: g, GoalContributions: c }) => ({
          id: String(g.Id),
          title: g.Title,
          description: g.Description,
          targetAmount: g.TargetAmount,
          currentAmount: g.CurrentAmount ?? 0,
          deadline: g.Deadline,
          status: g.Status === 1 ? "active" : g.Status === 2 ? "completed" : g.Status === 3 ? "cancelled" : "withdrawn",
          currency: g.Currency,
          myContribution: c?.CurrentAmount ?? 0,
          myTarget: c?.TargetAmount ?? 0,
          isMock: false,
        }))
      )
    } catch {
      // not a blocker — goal was created successfully
    }
  }

  const sortByDeadline = (list: GoalRow[]) =>
    [...list].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ active: true, completed: true, cancelled: true, withdrawn: true })

  const toggleSection = (status: string) =>
    setExpanded((prev) => ({ ...prev, [status]: !prev[status] }))

  const activeCount = goalsList.filter((g) => g.status === "active").length
  const totalSaved = goalsList.filter((g) => g.status === "active").reduce((acc, g) => acc + g.currentAmount, 0)
  const totalTarget = goalsList.filter((g) => g.status === "active").reduce((acc, g) => acc + g.targetAmount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
            <p className="text-muted-foreground">
              Track and manage all your savings goals in one place.
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Goal
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{goalsList.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Active Savings</p>
                <p className="text-2xl font-bold">${totalSaved.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Active Target</p>
                <p className="text-2xl font-bold">
                  ${totalTarget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Table */}
        {loadingGoals ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Loading goals...
          </div>
        ) : goalsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground">Create your first savings goal to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(["active", "completed", "cancelled", "withdrawn"] as const).map((status) => {
              const filtered = sortByDeadline(goalsList.filter((g) => g.status === status))
              if (filtered.length === 0) return null
              const label = status === "active" ? "Active" : status === "completed" ? "Completed" : status === "cancelled" ? "Cancelled" : "Completed & Withdrawn"
              const dotColor = status === "active" ? "bg-success" : status === "completed" ? "bg-primary" : status === "cancelled" ? "bg-destructive" : "bg-accent"
              return (
                <div key={status}>
                  <button
                    onClick={() => toggleSection(status)}
                    className="flex items-center gap-2 mb-3 text-base font-semibold hover:text-primary transition-colors"
                  >
                    {expanded[status] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", dotColor)} />
                    {label}
                    <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span>
                  </button>
                  {expanded[status] && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filtered.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          id={goal.id}
                          title={goal.title}
                          description={goal.description}
                          currentAmount={goal.currentAmount}
                          targetAmount={goal.targetAmount}
                          deadline={goal.deadline}
                          currency={goal.currency}
                          status={goal.status}
                          myContribution={goal.myContribution}
                          myTarget={goal.myTarget}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Create Goal Modal */}
        <CreateGoalModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onGoalCreated={handleGoalCreated}
        />
      </div>
    </DashboardLayout>
  )
}
