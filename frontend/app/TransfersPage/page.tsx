"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { AutoTransferForm } from "@/components/Forms/AutoTransferForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { RefreshCw, Trash2, DollarSign, Loader2 } from "lucide-react"
import { getCurrentUserTransfers, getGoalsByCurrentUser, deleteAutoTransfer, triggerAutomaticTransfer, type AutoTransfer, type SavingsGoal } from "@/lib/api"
import { toast } from "sonner"

function getNextTransferDate(frequency: string): string {
  const now = new Date()
  if (frequency.toLowerCase() === "monthly") {
    const next = new Date(now.getFullYear(), now.getMonth() + (now.getDate() === 1 ? 0 : 1), 1)
    return next.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })
  }
  // weekly — next Monday
  const day = now.getDay()
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntilMonday)
  return next.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<AutoTransfer[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [t, g] = await Promise.all([getCurrentUserTransfers(), getGoalsByCurrentUser()])
      setTransfers(t)
      setGoals(g)
    } catch {
      // silently fail — table will just be empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const [triggerLoading, setTriggerLoading] = useState(false)

  const handleTrigger = async () => {
    setTriggerLoading(true)
    try {
      await triggerAutomaticTransfer()
      toast.success("Transfers triggered successfully.")
      fetchData()
    } catch {
      toast.error("Failed to trigger transfers.")
    } finally {
      setTriggerLoading(false)
    }
  }

  const handleDelete = async (monthlyId: number) => {
    try {
      await deleteAutoTransfer(monthlyId)
      toast.success("Transfer deleted.")
      fetchData()
    } catch {
      toast.error("Failed to delete transfer.")
    }
  }

  const goalTitle = (goalId: number) =>
    goals.find((g) => g.Id === goalId)?.Title ?? `Goal #${goalId}`

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", minimumFractionDigits: 2 }).format(amount)

  const monthlyTotal = transfers
    .filter((t) => t.Frequency.toLowerCase() === "monthly")
    .reduce((acc, t) => acc + t.TransferAmount, 0)

  const weeklyTotal = transfers
    .filter((t) => t.Frequency.toLowerCase() === "weekly")
    .reduce((acc, t) => acc + t.TransferAmount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auto Transfers</h1>
            <p className="text-muted-foreground">Set up automatic recurring transfers to your savings goals.</p>
          </div>
          {/* TODO: REMOVE — test trigger only */}
          <Button variant="outline" onClick={handleTrigger} disabled={triggerLoading} className="gap-2 text-amber-600 border-amber-400 hover:bg-amber-50">
            {triggerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {triggerLoading ? "Triggering..." : "⚠ Simulate Transfers"}
          </Button>
          {/* END TODO */}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Transfers</p>
                <p className="text-2xl font-bold">{transfers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Total</p>
                <p className="text-2xl font-bold">{fmt(monthlyTotal)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly Total</p>
                <p className="text-2xl font-bold">{fmt(weeklyTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Active Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transfers...
                  </div>
                ) : transfers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <RefreshCw className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="font-medium">No active transfers</p>
                    <p className="text-sm text-muted-foreground">Set up a transfer using the form.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Goal</TableHead>
                          <TableHead className="font-semibold">Amount</TableHead>
                          <TableHead className="font-semibold">Frequency</TableHead>
                          <TableHead className="font-semibold">Next Transfer</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transfers.map((t) => (
                          <TableRow key={t.MonthlyId} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                  <RefreshCw className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium">{goalTitle(t.GoalId)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-success">{fmt(t.TransferAmount)}</TableCell>
                            <TableCell className="text-muted-foreground capitalize">{t.Frequency}</TableCell>
                            <TableCell className="text-muted-foreground">{getNextTransferDate(t.Frequency)}</TableCell>
                            <TableCell className="text-right">
                              <Button onClick={() => handleDelete(t.MonthlyId)} variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <AutoTransferForm
              goals={goals.map((g) => ({ id: String(g.Id), title: g.Title }))}
              onTransferCreated={fetchData}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
