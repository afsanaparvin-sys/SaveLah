"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { GoalCard } from "@/components/Dashboard/GoalCard"
import { CreateGoalModal } from "@/components/Goals/CreateGoalModal"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { getAllGoalsByUser } from "@/lib/api"
import { getUserId } from "@/lib/auth"
import { toast } from "sonner"

interface GoalRow {
  id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  deadline: string
  status: string
  currency: string
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
          records.map(({ SavingsGoal: g }) => ({
            id: String(g.Id),
            title: g.Title,
            description: g.Description,
            targetAmount: g.TargetAmount,
            currentAmount: g.CurrentAmount ?? 0,
            deadline: g.Deadline,
            status: g.Status === 1 ? "active" : g.Status === 2 ? "completed" : "cancelled",
            currency: g.Currency,
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
        records.map(({ SavingsGoal: g }) => ({
          id: String(g.Id),
          title: g.Title,
          description: g.Description,
          targetAmount: g.TargetAmount,
          currentAmount: g.CurrentAmount ?? 0,
          deadline: g.Deadline,
          status: g.Status === 1 ? "active" : g.Status === 2 ? "completed" : "cancelled",
          currency: g.Currency,
          isMock: false,
        }))
      )
    } catch {
      // not a blocker — goal was created successfully
    }
  }

  const activeCount = goalsList.filter((g) => g.status === "active").length
  const totalTarget = goalsList.reduce((acc, g) => acc + g.targetAmount, 0)

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
        <div className="grid gap-4 md:grid-cols-3">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {goalsList.map((goal) => (
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
              />
            ))}
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
