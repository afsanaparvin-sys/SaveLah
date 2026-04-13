"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { SummaryStatCard } from "@/components/Dashboard/SummaryStatCard"
import { SavingsChart } from "@/components/Dashboard/SavingsChart"
import { RecentActivity } from "@/components/Dashboard/RecentActivity"
import { Wallet, Target, RefreshCw, Coins } from "lucide-react"
import { getSavingsGrowth, getKPICardDetails, type KPICardData } from "@/lib/api"

export default function DashboardPage() {
  const [chartData, setChartData] = useState<Array<{ month: string; savings: number }>>([])
  const [kpi, setKpi] = useState<KPICardData | null>(null)

  useEffect(() => {
    getSavingsGrowth().then(setChartData).catch(console.error)
    getKPICardDetails().then(setKpi).catch(console.error)
  }, [])

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)

  const fmtPct = (value: number) => `${Math.abs(value).toFixed(1)}%`

  const totalSavings = kpi?.TotalSavingsCard?.CurrentTotalSavings ?? 0
  const totalSavingsDiff = kpi?.TotalSavingsCard?.DifferenceFromLastMonth
  const monthlyAmount = kpi?.RecurringTransfersCard?.MonthlyAmount ?? 0
  const weeklyAmount = kpi?.RecurringTransfersCard?.WeeklyAmount
  const roundUpThisMonth = kpi?.DirectAndRoundUpSavingsCard?.RoundUpSavingsThisMonth ?? 0
  const roundUpDiff = kpi?.DirectAndRoundUpSavingsCard?.RoundUpSavingsDifferenceFromLastMonth

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your savings overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryStatCard
            title="Total Savings"
            value={kpi ? fmt(totalSavings) : "—"}
            icon={Wallet}
            trend={totalSavingsDiff != null ? {
              value: fmtPct(totalSavingsDiff),
              positive: totalSavingsDiff >= 0,
            } : undefined}
          />

          <SummaryStatCard
            title="Goal Overview"
            value={kpi ? String((kpi.GoalOverviewCard?.TotalActive ?? 0) + (kpi.GoalOverviewCard?.TotalCompleted ?? 0) + (kpi.GoalOverviewCard?.TotalCancelled ?? 0)) + " total" : "—"}
            icon={Target}
            subStats={kpi ? [
              { label: "Active", value: String(kpi.GoalOverviewCard?.TotalActive ?? 0), change: kpi.GoalOverviewCard?.TotalAddedThisMonth != null ? { value: `${kpi.GoalOverviewCard.TotalAddedThisMonth} this month`, positive: true } : undefined },
              { label: "Completed", value: String(kpi.GoalOverviewCard?.TotalCompleted ?? 0), change: kpi.GoalOverviewCard?.TotalCompletedThisMonth != null ? { value: `${kpi.GoalOverviewCard.TotalCompletedThisMonth} this month`, positive: true } : undefined },
              { label: "Cancelled", value: String(kpi.GoalOverviewCard?.TotalCancelled ?? 0), change: kpi.GoalOverviewCard?.TotalCancelledThisMonth != null ? { value: `${kpi.GoalOverviewCard.TotalCancelledThisMonth} this month`, positive: false } : undefined },
            ] : undefined}
          />

          <SummaryStatCard
            title="Recurring Savings This Month"
            value={kpi ? fmt(monthlyAmount + (weeklyAmount ?? 0)) : "—"}
            icon={RefreshCw}
            subStats={kpi ? [
              { label: "Monthly", value: fmt(monthlyAmount) },
              { label: "Weekly", value: fmt(weeklyAmount ?? 0) },
            ] : undefined}
          />

          <SummaryStatCard
            title="Round-Up Savings This Month"
            value={kpi ? fmt(roundUpThisMonth) : "—"}
            icon={Coins}
            trend={roundUpDiff != null ? {
              value: fmtPct(roundUpDiff),
              positive: roundUpDiff >= 0,
            } : undefined}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><SavingsChart data={chartData} /></div>
          <div className="lg:col-span-1"><RecentActivity /></div>
        </div>
      </div>
    </DashboardLayout>
  )
}
