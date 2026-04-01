import React from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { SummaryStatCard } from "@/components/Dashboard/SummaryStatCard"
import { GoalCard } from "@/components/Dashboard/GoalCard"
import { SavingsChart } from "@/components/Dashboard/SavingsChart"
import { RecentActivity } from "@/components/Dashboard/RecentActivity"
import { Wallet, Target, RefreshCw, Coins } from "lucide-react"
import {
  summaryStats,
  goals,
  savingsChartData,
  recentTransactions,
} from "@/lib/mock-data"

export default function DashboardPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your savings overview.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryStatCard title="Total Savings" value={formatCurrency(summaryStats.totalSavings)} icon={Wallet} trend={{ value: "12.5%", positive: true }} />
          <SummaryStatCard title="Active Goals" value={summaryStats.activeGoals.toString()} icon={Target} />
          <SummaryStatCard title="Monthly Transfer" value={formatCurrency(summaryStats.monthlyTransfer)} icon={RefreshCw} />
          <SummaryStatCard title="Round-Up Savings" value={formatCurrency(summaryStats.roundUpSavings)} icon={Coins} trend={{ value: "8.2%", positive: true }} />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><SavingsChart data={savingsChartData} /></div>
          <div className="lg:col-span-1"><RecentActivity/></div>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Your Savings Goals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} id={goal.id} title={goal.title} description={goal.description} currentAmount={goal.currentAmount} targetAmount={goal.targetAmount} deadline={goal.deadline} currency={goal.currency} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}