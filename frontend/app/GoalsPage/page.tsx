"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { GoalsTable } from "@/components/Goals/GoalsTable"
import { CreateGoalModal } from "@/components/Goals/CreateGoalModal"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import { goals } from "@/lib/mock-data"

export default function GoalsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

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
                <p className="text-2xl font-bold">{goals.length}</p>
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
                <p className="text-2xl font-bold">
                  {goals.filter((g) => g.status === "active").length}
                </p>
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
                  ${goals.reduce((acc, g) => acc + g.targetAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Table */}
        <GoalsTable goals={goals} />

        {/* Create Goal Modal */}
        <CreateGoalModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>
    </DashboardLayout>
  )
}
