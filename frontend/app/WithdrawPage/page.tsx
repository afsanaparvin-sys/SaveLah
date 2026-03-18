import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { WithdrawalForm } from "@/components/Forms/WithdrawalForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, Shield, Clock, Wallet } from "lucide-react"
import { goals, summaryStats } from "@/lib/mock-data"

export default function WithdrawPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const goalsWithBalance = goals.map((g) => ({
    id: g.id,
    title: g.title,
    currentAmount: g.currentAmount,
    currency: g.currency,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground">
            Transfer funds from your savings goals to your bank account.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <WithdrawalForm goals={goalsWithBalance} />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summaryStats.totalSavings)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowDownCircle className="h-5 w-5 text-primary" />
                  Withdrawal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <Clock className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-sm text-muted-foreground">
                      Withdrawals are typically processed within 1-2 business
                      days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secure Transfers</p>
                    <p className="text-sm text-muted-foreground">
                      All transfers are encrypted and protected by bank-level
                      security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-muted/50 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Withdrawing
                  funds will reduce your progress towards your savings goal.
                  Consider your goals before making a withdrawal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
