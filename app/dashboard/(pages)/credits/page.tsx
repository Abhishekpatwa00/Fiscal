"use client"

import { useMemo } from "react"
import { useFinance } from "@/components/context/finance-context"
import { TableElement, type Expenses } from "@/components/routes/v1/table"
import { AddExpense } from "@/components/routes/v1/add"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { ArrowDownLeft, Calendar, TrendingUp } from "lucide-react"

const PIE_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
]

export default function CreditsPage() {
  const { expenses, refreshFinanceData } = useFinance()


  const credits = useMemo(
    () => expenses.filter((item: any) => item.type === "credit"),
    [expenses]
  )

  // 2. KPI Metrics
  const { totalCredits, thisMonthCredits, topSource } = useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    let total = 0
    let monthTotal = 0
    const tagTotals: Record<string, number> = {}

    for (const c of credits) {
      const amt = Number(c.amount) || 0
      total += amt
      if (c.expense_date?.startsWith(currentMonth)) {
        monthTotal += amt
      }
      const tag = c.tag?.trim() || "Untagged"
      tagTotals[tag] = (tagTotals[tag] || 0) + amt
    }

    const top = Object.entries(tagTotals).sort((a, b) => b[1] - a[1])[0]

    return {
      totalCredits: total,
      thisMonthCredits: monthTotal,
      topSource: top ? `${top[0]} (₹${top[1].toLocaleString("en-IN")})` : "—",
    }
  }, [credits])

  // 3. Monthly Trend Data (sorted chronologically)
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of credits) {
      const monthKey = c.expense_date?.slice(0, 7) // "YYYY-MM"
      if (!monthKey) continue
      map[monthKey] = (map[monthKey] || 0) + (Number(c.amount) || 0)
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
  }, [credits])

  // 4. Tag Breakdown Data (for Donut Chart)
  const tagData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of credits) {
      const tag = c.tag?.trim() || "Untagged"
      map[tag] = (map[tag] || 0) + (Number(c.amount) || 0)
    }

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [credits])

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
          <p className="text-sm text-muted-foreground">
            Track your income sources and monthly inflow.
          </p>
        </div>
        <AddExpense onAddSuccess={refreshFinanceData} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            Total Credits
          </span>
          <strong className="text-2xl text-emerald-600">
            ₹{totalCredits.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            This Month
          </span>
          <strong className="text-2xl">
            ₹{thisMonthCredits.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Top Source
          </span>
          <strong className="text-lg truncate">{topSource}</strong>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-3 p-4 rounded-xl border bg-card flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Monthly Credit Trend</h2>
          {monthlyData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-16 text-center">
              Add credit transactions to see your monthly trend.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="creditFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      "Credited",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#creditFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Source Breakdown Donut Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl border bg-card flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Credits by Tag</h2>
          {tagData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-16 text-center">
              No tagged credits yet.
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

      {/* Credits Table */}
      <div className="p-8 rounded-xl border bg-card flex flex-col gap-3">
        <h2 className="text-sm font-semibold">All Credit Transactions</h2>
        <TableElement
          expenses={credits as Expenses[]}
          onChangeSuccess={refreshFinanceData}
          type="credit"
        />
      </div>
    </div>
  )
}
