"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Coins, TrendingUp } from "lucide-react"
import { PaymentHistory } from "@/components/Dashboard/PaymentHistory"

interface Payment {
  PaymentId: number
  SavingsAmount: number
  TotalAmount: number
  TransactionDate: string
  MerchantId: number
  Currency: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((c) => c.startsWith("auth_token="))
          ?.split("=")[1]
        const res = await fetch(
          "https://personal-8wlttpq2.outsystemscloud.com/PaymentAtomicService/rest/PaymentAPI/GetPaymentByUserId",
          { headers: { Authorization: token ?? "" } }
        )
        if (!res.ok) return
        const data: Payment[] = await res.json()
        setPayments(data)
      } catch { }
    }
    fetchPayments()
  }, [refreshKey])

  const totalRoundUp = payments.reduce((s, p) => s + (parseFloat(String(p.SavingsAmount)) || 0), 0)
  const avgRoundUp = payments.length > 0 ? totalRoundUp / payments.length : 0

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(n)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Simulate purchases to see how round-ups contribute to your savings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PaymentHistory key={refreshKey} />

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
                  <p className="text-sm text-muted-foreground">Total Round-Up Savings</p>
                  <p className="text-2xl font-bold">{fmt(totalRoundUp)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Round-Up</p>
                  <p className="text-2xl font-bold">{fmt(avgRoundUp)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}