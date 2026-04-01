"use client"

import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { PaymentForm } from "@/components/Forms/PaymentForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Coins, TrendingUp } from "lucide-react"
import { goals, summaryStats } from "@/lib/mock-data"
import { PaymentHistory } from "@/components/Dashboard/PaymentHistory"

export default function PaymentsPage() {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Payment Simulation
          </h1>
          <p className="text-muted-foreground">
            Simulate purchases to see how round-ups contribute to your savings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm goals={goals.map((g) => ({ id: g.id, title: g.title }))} />
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  How Round-Ups Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  When you make a purchase, we round up to the nearest dollar
                  and save the difference to your chosen goal.
                </p>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-medium text-foreground">Example:</p>
                  <p>Purchase: $7.20</p>
                  <p>Rounded: $8.00</p>
                  <p className="text-success font-medium">Savings: +$0.80</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Coins className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Round-Up Savings
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summaryStats.roundUpSavings)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Average Round-Up
                  </p>
                  <p className="text-2xl font-bold">$0.47</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment History - full width below */}
        <PaymentHistory/>
      </div>
    </DashboardLayout>
  )
}