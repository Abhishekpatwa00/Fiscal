"use client"

import { useMemo } from "react"
import { useFinance } from "@/components/context/finance-context"
import { TableElement, type Expenses } from "@/components/routes/v1/table"
import { AddExpense } from "@/components/routes/v1/add" // update path if different
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { ArrowUpRight, Calendar, Flame } from "lucide-react"

const PIE_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
]

export default function ExpensesPage() {
  const { expenses, refreshFinanceData } = useFinance()

  // 1. Filter only expense transactions
  const expenseList = useMemo(
    () => expenses.filter((item: any) => item.type === "expense"),
    [expenses]
  )

  // 2. KPI Metrics
  const { totalSpent, thisMonthSpent, topCategory } = useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    let total = 0
    let monthTotal = 0
    const tagTotals: Record<string, number> = {}

    for (const item of expenseList) {
      const amt = Number(item.amount) || 0
      total += amt
      if (item.expense_date?.startsWith(currentMonth)) {
        monthTotal += amt
      }
      const tag = item.tag?.trim() || "Untagged"
      tagTotals[tag] = (tagTotals[tag] || 0) + amt
    }

    const top = Object.entries(tagTotals).sort((a, b) => b[1] - a[1])[0]

    return {
      totalSpent: total,
      thisMonthSpent: monthTotal,
      topCategory: top ? `${top[0]} (₹${top[1].toLocaleString("en-IN")})` : "—",
    }
  }, [expenseList])

  // 3. Monthly Spending Data (sorted chronologically)
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of expenseList) {
      const monthKey = item.expense_date?.slice(0, 7) // "YYYY-MM"
      if(!monthKey) continue
            map[monthKey] = (map[monthKey] || 0) + (Number(item.amount) || 0)
          }

          return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, amount]) => {
              const [year, m] = month.split("-")
              const label = new Date(Number(year), Number(m) - 1).toLocaleDateString(
                "en-IN",
                { month: "short", year: "2-digit" }
              )
              return { month: label, amount }
            })
        }, [expenseList])

        // 4. Tag Breakdown Data (for Donut Chart)
        const tagData = useMemo(() => {
          const map: Record<string, number> = {}
          for (const item of expenseList) {
            const tag = item.tag?.trim() || "Untagged"
            map[tag] = (map[tag] || 0) + (Number(item.amount) || 0)
          }

          return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        }, [expenseList])

        return (
          <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
                <p className="text-sm text-muted-foreground">
                  Monitor your spending habits and category breakdown.
                </p>
              </div>
              <AddExpense onAddSuccess={refreshFinanceData} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                  Total Spent
                </span>
                <strong className="text-2xl text-red-600 dark:text-red-400">
                  ₹{totalSpent.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  This Month
                </span>
                <strong className="text-2xl">
                  ₹{thisMonthSpent.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Top Category
                </span>
                <strong className="text-lg truncate">{topCategory}</strong>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Monthly Spending Bar Chart */}
              <div className="lg:col-span-3 p-4 rounded-xl border bg-card flex flex-col gap-3">
                <h2 className="text-sm font-semibold">Monthly Spending</h2>
                {monthlyData.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-16 text-center">
                    Add expense transactions to see your monthly spending.
                  </p>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(v) => `₹${v}`}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `₹${Number(value).toLocaleString("en-IN")}`,
                            "Spent",
                          ]}
                        />
                        <Bar
                          dataKey="amount"
                          fill="#ef4444"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Category Breakdown Donut Chart */}
              <div className="lg:col-span-2 p-4 rounded-xl border bg-card flex flex-col gap-3">
                <h2 className="text-sm font-semibold">Spending by Tag</h2>
                {tagData.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-16 text-center">
                    No tagged expenses yet.
                  </p>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tagData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {tagData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={PIE_COLORS[idx % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) =>
                            `₹${Number(value).toLocaleString("en-IN")}`
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Expenses Table */}
            <div className="p-8 rounded-xl border bg-card flex flex-col gap-3">
              <h2 className="text-sm font-semibold">All Expense Transactions</h2>
              <TableElement
                expenses={expenseList as Expenses[]}
                onChangeSuccess={refreshFinanceData}
                type="expense"
              />
            </div>
          </div>
        )
      }
