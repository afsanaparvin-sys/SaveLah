"use client"

import { DashboardLayout } from "@/components/Layout/DashboardLayout"
import { AutoTransferForm } from "@/components/Forms/AutoTransferForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RefreshCw, Trash2, DollarSign, Pencil } from "lucide-react"
import { goals, monthlyTransfers } from "@/lib/mock-data"

export default function TransfersPage() {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalMonthlyAmount = monthlyTransfers.reduce(
    (acc, t) => acc + t.amount,
    0
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Auto Transfers
          </h1>
          <p className="text-muted-foreground">
            Set up automatic recurring transfers to your savings goals.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Transfers</p>
                <p className="text-2xl font-bold">{monthlyTransfers.length}</p>
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
                <p className="text-2xl font-bold">
                  {formatCurrency(totalMonthlyAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Transfers Table */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Active Transfers</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {monthlyTransfers.map((transfer) => (
                        <TableRow key={transfer.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <RefreshCw className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">
                                {transfer.goalTitle}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            {formatCurrency(transfer.amount, transfer.currency)}
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">
                            {transfer.frequency ?? "Monthly"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {transfer.nextTransferDate ?? "Apr 1"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Transfer Form */}
          <div>
            <AutoTransferForm
              goals={goals.map((g) => ({ id: g.id, title: g.title }))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}