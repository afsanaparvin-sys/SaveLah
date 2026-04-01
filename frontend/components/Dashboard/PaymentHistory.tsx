"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, Loader2, AlertCircle } from "lucide-react"

interface Payment {
  PaymentId: number
  UserId: string
  ItemAmount: number
  SavingsAmount: number
  TotalAmount: number
  TransactionDate: string
  MerchantId: number
  Currency: string
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayments = async () => {
        try {
          setLoading(true)
          setError(null)
      
          const token = document.cookie
            .split("; ")
            .find((c) => c.startsWith("auth_token="))
            ?.split("=")[1]

          const res = await fetch(
            `https://personal-8wlttpq2.outsystemscloud.com/PaymentAtomicService/rest/PaymentAPI/GetPaymentByUserId`,
            {
              headers: { 
                "Authorization": token ?? ""  // no "Bearer " prefix
              }
            }
          )
      
          console.log("2. Status:", res.status)  // 200? 401? 500?
      
          const raw = await res.text()
          console.log("3. Raw response:", raw)  // what did OutSystems actually return?
      
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
          const data: Payment[] = JSON.parse(raw)
          setPayments(data)
        } catch (err) {
          console.log("4. Error:", err)
          setError("Failed to load payment history. Please try again.")
        } finally {
          setLoading(false)
        }
      }
    fetchPayments()
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(amount)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-SG", {
      day: "numeric", month: "short", year: "numeric",
    })

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-primary" />
          Payment History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading payments...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && payments.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No payments yet. Make a purchase to get started!
          </p>
        )}

        {/* Table */}
        {!loading && !error && payments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Item Amount</th>
                  <th className="pb-3 font-medium">Round-Up Saved</th>
                  <th className="pb-3 font-medium">Total Charged</th>
                  <th className="pb-3 font-medium">Merchant</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.PaymentId}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 text-muted-foreground">
                      {formatDate(p.TransactionDate)}
                    </td>
                    <td className="py-3">
                      {formatCurrency(p.ItemAmount)}
                    </td>
                    <td className="py-3 text-success font-medium">
                      +{formatCurrency(p.SavingsAmount)}
                    </td>
                    <td className="py-3 font-medium">
                      {formatCurrency(p.TotalAmount)}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      #{p.MerchantId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}