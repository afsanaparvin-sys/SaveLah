"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"

interface SavingsChartProps {
  data: Array<{
    month: string
    savings: number
  }>
}

export function SavingsChart({ data }: SavingsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate growth
  const firstValue = data[0]?.savings || 0
  const lastValue = data[data.length - 1]?.savings || 0
  const growthPercent = firstValue > 0 ? ((lastValue - firstValue) / firstValue * 100).toFixed(1) : 0

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Savings Growth</CardTitle>
          <p className="text-sm text-muted-foreground">Your savings over time</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm font-semibold text-success">+{growthPercent}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.35 0.12 255)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.35 0.12 255)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklch(0.9 0.01 250)"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.5 0.02 250)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.5 0.02 250)", fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card p-3 shadow-lg">
                        <p className="text-sm text-muted-foreground">
                          {payload[0].payload.month}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(payload[0].value as number)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="oklch(0.35 0.12 255)"
                strokeWidth={2.5}
                fill="url(#savingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
