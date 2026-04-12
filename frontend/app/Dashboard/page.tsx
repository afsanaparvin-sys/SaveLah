"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { SummaryStatCard } from "@/components/Dashboard/SummaryStatCard"
import { SavingsChart } from "@/components/Dashboard/SavingsChart"
import { RecentActivity } from "@/components/Dashboard/RecentActivity"
import { Wallet, Target, RefreshCw, Coins } from "lucide-react"
import { getSavingsGrowth, getKPICardDetails, type KPICardData } from "@/lib/api"

// TODO: REMOVE — test data only
const MOCK_KPI: KPICardData = {
  TotalSavingsCard: { CurrentTotalSavings: 12450, DifferenceFromLastMonth: 12.5 },
  GoalOverviewCard: { TotalActive: 4, TotalAddedThisMonth: 2, TotalCompleted: 6, TotalCompletedThisMonth: 1, TotalCancelled: 2, TotalCancelledThisMonth: 1 },
  RecurringTransfersCard: { MonthlyAmount: 850, WeeklyAmount: 400 },
  DirectAndRoundUpSavingsCard: { RoundUpSavingsThisMonth: 124.65, RoundUpSavingsDifferenceFromLastMonth: 8.2, DirectSavingsThisMonth: 500, DirectSavingsDifferenceFromLastMonth: 5.1 },
}
const MOCK_CHART = [
  { month: "Jan", savings: 4200 }, { month: "Feb", savings: 5100 }, { month: "Mar", savings: 6400 },
  { month: "Apr", savings: 7800 }, { month: "May", savings: 9100 }, { month: "Jun", savings: 10500 },
  { month: "Jul", savings: 11200 }, { month: "Aug", savings: 12450 },
]
// END TODO

export default function DashboardPage() {
  const [chartData, setChartData] = useState<Array<{ month: string; savings: number }>>([])
  const [kpi, setKpi] = useState<KPICardData | null>(null)
  // TODO: REMOVE — test toggle only
  const [useMock, setUseMock] = useState(false)
  const activeKpi = useMock ? MOCK_KPI : kpi
  const activeChartData = useMock ? MOCK_CHART : chartData
  // END TODO

  useEffect(() => {
    if (useMock) return
    getSavingsGrowth().then(setChartData).catch(console.error)
    getKPICardDetails().then(setKpi).catch(console.error)
  }, [useMock])

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)

  const fmtPct = (value: number) => `${Math.abs(value).toFixed(1)}%`

  const totalSavings = activeKpi?.TotalSavingsCard?.CurrentTotalSavings ?? 0
  const totalSavingsDiff = activeKpi?.TotalSavingsCard?.DifferenceFromLastMonth
  const totalActive = activeKpi?.GoalOverviewCard?.TotalActive ?? 0
  const totalAddedThisMonth = activeKpi?.GoalOverviewCard?.TotalAddedThisMonth
  const monthlyAmount = activeKpi?.RecurringTransfersCard?.MonthlyAmount ?? 0
  const weeklyAmount = activeKpi?.RecurringTransfersCard?.WeeklyAmount
  const roundUpThisMonth = activeKpi?.DirectAndRoundUpSavingsCard?.RoundUpSavingsThisMonth ?? 0
  const roundUpDiff = activeKpi?.DirectAndRoundUpSavingsCard?.RoundUpSavingsDifferenceFromLastMonth

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s your savings overview.</p>
          </div>
          {/* TODO: REMOVE — test toggle only */}
          <button
            onClick={() => setUseMock((v) => !v)}
            className="text-xs px-3 py-1 rounded-full border font-medium"
            style={{ borderColor: useMock ? "#f59e0b" : "#6B7F8E", color: useMock ? "#f59e0b" : "#6B7F8E" }}
          >
            {useMock ? "⚠ Test Data" : "Live Data"}
          </button>
          {/* END TODO */}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryStatCard
            title="Total Savings"
            value={activeKpi ? fmt(totalSavings) : "—"}
            icon={Wallet}
            trend={totalSavingsDiff != null ? {
              value: fmtPct(totalSavingsDiff),
              positive: totalSavingsDiff >= 0,
            } : undefined}
          />

          <SummaryStatCard
            title="Goal Overview"
            value={activeKpi ? String((activeKpi.GoalOverviewCard?.TotalActive ?? 0) + (activeKpi.GoalOverviewCard?.TotalCompleted ?? 0) + (activeKpi.GoalOverviewCard?.TotalCancelled ?? 0)) + " total" : "—"}
            icon={Target}
            subStats={activeKpi ? [
              { label: "Active", value: String(activeKpi.GoalOverviewCard?.TotalActive ?? 0), change: activeKpi.GoalOverviewCard?.TotalAddedThisMonth != null ? { value: `${activeKpi.GoalOverviewCard.TotalAddedThisMonth} this month`, positive: true } : undefined },
              { label: "Completed", value: String(activeKpi.GoalOverviewCard?.TotalCompleted ?? 0), change: activeKpi.GoalOverviewCard?.TotalCompletedThisMonth != null ? { value: `${activeKpi.GoalOverviewCard.TotalCompletedThisMonth} this month`, positive: true } : undefined },
              { label: "Cancelled", value: String(activeKpi.GoalOverviewCard?.TotalCancelled ?? 0), change: activeKpi.GoalOverviewCard?.TotalCancelledThisMonth != null ? { value: `${activeKpi.GoalOverviewCard.TotalCancelledThisMonth} this month`, positive: false } : undefined },
            ] : undefined}
          />

          <SummaryStatCard
            title="Recurring Transfers"
            value={activeKpi ? fmt(monthlyAmount + (weeklyAmount ?? 0)) : "—"}
            icon={RefreshCw}
            subStats={activeKpi ? [
              { label: "Monthly", value: fmt(monthlyAmount) },
              { label: "Weekly", value: fmt(weeklyAmount ?? 0) },
            ] : undefined}
          />

          <SummaryStatCard
            title="Round-Up Savings"
            value={activeKpi ? fmt(roundUpThisMonth) : "—"}
            icon={Coins}
            trend={roundUpDiff != null ? {
              value: fmtPct(roundUpDiff),
              positive: roundUpDiff >= 0,
            } : undefined}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><SavingsChart data={activeChartData} /></div>
          <div className="lg:col-span-1"><RecentActivity /></div>
        </div>


      </div>
    </DashboardLayout>
  )
}
