"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Expenses } from "./table"

const cashflowConfig = {
  credit: {
    label: "Credit (Income)",
    color: "#10b981", // emerald-500
  },
  expense: {
    label: "Expense (Debit)",
    color: "#ef4444", // red-500
  },
} satisfies ChartConfig

const categoryConfig = {
  amount: {
    label: "Spent",
    color: "#f97316", // orange-500
  },
} satisfies ChartConfig

export function ExpenseAnalytics({
  transactions,
  selectedMonth,
}: {
  transactions: Expenses[]
  selectedMonth: string
}) {
  // 1. Calculate Summary Totals
  const { totalExpense, totalCredit, netBalance } = useMemo(() => {
    let exp = 0
    let cred = 0
    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0
      if (t.type === "credit") cred += amt
      else exp += amt
    })
    return {
      totalExpense: exp,
      totalCredit: cred,
      netBalance: cred - exp,
    }
  }, [transactions])

  // 2. Group Data for Cashflow Bar Chart (By Month if "all", or by Day if a specific month is selected)
  const cashflowData = useMemo(() => {
    const map = new Map<string, { period: string; credit: number; expense: number }>()

    transactions.forEach((t) => {
      const rawDate = t.expense_date ? t.expense_date.split("T")[0] : ""
      if (!rawDate) return

      // If "all" months selected, group by YYYY-MM; otherwise group by YYYY-MM-DD
      const key = selectedMonth === "all" ? rawDate.slice(0, 7) : rawDate
      const existing = map.get(key) || { period: key, credit: 0, expense: 0 }

      if (t.type === "credit") {
        existing.credit += Number(t.amount) || 0
      } else {
        existing.expense += Number(t.amount) || 0
      }
      map.set(key, existing)
    })

    return Array.from(map.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    )
  }, [transactions, selectedMonth])

  // 3. Group Data for Category Breakdown (Expenses Only)
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()

    transactions
      .filter((t) => t.type !== "credit")
      .forEach((t) => {
        const tag = (t.tag || "other").trim().toLowerCase()
        map.set(tag, (map.get(tag) || 0) + (Number(t.amount) || 0))
      })

    return Array.from(map.entries())
      .map(([tag, amount]) => ({
        tag: tag.charAt(0).toUpperCase() + tag.slice(1),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6) // Top 6 categories
  }, [transactions])

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* --- SUMMARY KPI CARDS (1 col on mobile, 3 cols on desktop) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Credits (Income)</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +₹{totalCredit.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              -₹{totalExpense.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Balance</CardDescription>
            <CardTitle
              className={`text-2xl font-bold ${
                netBalance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* --- CHARTS GRID (Stacks on mobile, side-by-side on desktop) --- */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Credits vs Expenses */}
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Credits vs. Expenses
              </CardTitle>
              <CardDescription>
                {selectedMonth === "all"
                  ? "Monthly cashflow comparison"
                  : `Daily activity for ${selectedMonth}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={cashflowConfig} className="h-[240px] w-full">
                <BarChart data={cashflowData} accessibilityLayer>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    tickFormatter={(val) =>
                      selectedMonth === "all" ? val : val.slice(8, 10)
                    }
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="credit"
                    fill="var(--color-credit)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Spending by Category Tag */}
          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Top Spending Categories
              </CardTitle>
              <CardDescription>
                Where your money went ({selectedMonth === "all" ? "All Time" : selectedMonth})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={categoryConfig} className="h-[240px] w-full">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ left: 12, right: 12 }}
                    accessibilityLayer
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <YAxis
                      dataKey="tag"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <XAxis type="number" hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="amount"
                      fill="var(--color-amount)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
                  No expenses recorded for this period.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
