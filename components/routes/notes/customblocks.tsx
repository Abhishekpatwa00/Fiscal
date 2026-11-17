"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useFinance } from "@/components/context/finance-context"
import { PiggyBank } from "lucide-react"

export const BudgetTrackerBlock = createReactBlockSpec(
  {
    type: "budgetTracker",
    propSchema: {
      category: { default: "Food" },
      limit: { default: "5000" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { expenses } = useFinance()
      const { category, limit } = props.block.props

      const spent = expenses
        .filter(
          (item) =>
            item.tag?.toLowerCase().trim() ===
            category.toLowerCase().trim()
        )
        .reduce((sum, item) => sum + Number(item.amount || 0), 0)

      const numericLimit = Math.max(Number(limit) || 1, 1)
      const percentage = Math.min(Math.round((spent / numericLimit) * 100), 100)
      const isOverBudget = spent > Number(limit)

      return (
        <div
          contentEditable={false}
          className="my-3 p-4 rounded-xl border bg-card shadow-xs flex flex-col gap-3 select-none"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-primary shrink-0" />
              <input
                type="text"
                value={category}
                placeholder="Category (e.g. Food)"
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: { category: e.target.value },
                  })
                }
                className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-40"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Limit: ₹</span>
              <input
                type="number"
                value={limit}
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: { limit: e.target.value },
                  })
                }
                className="w-24 font-semibold text-foreground bg-secondary/60 px-2 py-0.5 rounded border outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverBudget ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Spent:{" "}
              <strong className="text-foreground">
                ₹{spent.toLocaleString("en-IN")}
              </strong>
            </span>
            <span
              className={`font-medium ${
                isOverBudget ? "text-red-500" : "text-emerald-600"
              }`}
            >
              {isOverBudget
                ? `Over by ₹${(spent - Number(limit)).toLocaleString("en-IN")}`
                : `₹${(Number(limit) - spent).toLocaleString("en-IN")} left (${percentage}%)`}
            </span>
          </div>
        </div>
      )
    },
  }
)
