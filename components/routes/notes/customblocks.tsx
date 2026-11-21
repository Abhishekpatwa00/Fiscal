"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { useFinance } from "@/components/context/finance-context"
import { PiggyBank } from "lucide-react"

// 1. Separate React component so useFinance() always re-renders on context updates
function BudgetTrackerView({
  block,
  editor,
}: {
  block: any
  editor: any
}) {
  const { expenses } = useFinance()
  const { category, limit } = block.props

  // DEBUG: Open browser DevTools Console (F12) to verify expenses & item.tag
  console.log("BudgetTracker expenses:", expenses)

  const saved = expenses
    .filter((item: any) => {
      const itemTag = item.tag ?? ""
      return (
        item.type === "credit" &&
        String(itemTag).toLowerCase().trim() ===
          String(category).toLowerCase().trim()
      )
    })
    .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)

  const numericGoal = Math.max(Number(limit) || 1, 1)
  const percentage = Math.min(Math.round((saved / numericGoal) * 100), 100)
  const isGoalReached = saved >= Number(limit)

  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="my-3 p-4 rounded-xl border  shadow-xs flex flex-col gap-3 select-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            value={category}
            placeholder="Category (e.g. Food)"
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { category: e.target.value },
              })
            }
            className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-40"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Target: ₹</span>
          <input
            type="number"
            value={limit}
            onChange={(e) =>
              editor.updateBlock(block, {
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
            isGoalReached ? "bg-emerald-500" : "bg-foreground"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Saved:{" "}
          <strong className="text-foreground">
            ₹{saved.toLocaleString("en-IN")}
          </strong>
        </span>
        <span
          className={`font-medium ${
            isGoalReached ? "text-emerald-600" :  "text-red-500"
          }`}
        >
          {isGoalReached
            ? `Over by ₹${(saved - Number(limit)).toLocaleString("en-IN")}`
            : `₹${(Number(limit) - saved).toLocaleString("en-IN")} left (${percentage}%)`}
        </span>
      </div>
    </div>
  )
}

// 2. Register the BlockNote spec
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
    render: (props) => (
      <BudgetTrackerView block={props.block} editor={props.editor} />
    ),
  }
)




import { useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { ArrowDownLeft, ArrowUpRight, Check, Loader2, Plus } from "lucide-react"

function QuickAddView({ block, editor }: { block: any; editor: any }) {
  const supabase = createClient()
  const { refreshFinanceData } = useFinance()

  const {
    isSaved,
    title: savedTitle,
    amount: savedAmount,
    tag: savedTag,
    txType: savedType,
    expenseDate: savedDate,
  } = block.props

  const [title, setTitle] = useState(savedTitle || "")
  const [amount, setAmount] = useState(savedAmount || "")
  const [tag, setTag] = useState(savedTag || "")
  const [txType, setTxType] = useState<"expense" | "credit">(
    savedType === "credit" ? "credit" : "expense"
  )
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setErrorMsg("Enter a valid title and amount.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg("You must be logged in.")
      setSubmitting(false)
      return
    }

    const today = new Date().toISOString().split("T")[0]
    const cleanTag = tag.trim() || "General"

    const { data, error } = await supabase
      .from("expense")
      .insert({
        user_id: user.id,
        title: title.trim(),
        amount: Number(amount),
        tag: cleanTag,
        expense_date: today,
        type: txType,
      })
      .select()
      .single()

    if (error) {
      setErrorMsg(error.message)
      setSubmitting(false)
      return
    }

    // 1. Update global FinanceContext so other blocks (like /budget) update live
    await refreshFinanceData()

    // 2. Transform this block into a saved transaction row
    editor.updateBlock(block, {
      props: {
        isSaved: "true",
        transactionId: String(data.id),
        title: title.trim(),
        amount: String(amount),
        tag: cleanTag,
        txType,
        expenseDate: today,
      },
    })

    setSubmitting(false)
  }

  // --- STATE 2: SAVED TRANSACTION ROW ---
  if (isSaved === "true") {
    const isCredit = savedType === "credit"
    return (
      <div
        contentEditable={false}
        onMouseDown={(e) => e.stopPropagation()}
        className="my-2 px-3.5 py-2.5 rounded-lg border  flex items-center justify-between gap-3 select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
              isCredit
                ? "bg-emerald-500/15 text-emerald-600"
                : "bg-red-500/15 text-red-600"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft className="w-4 h-4" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{savedTitle}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 rounded bg-secondary text-[11px]">
                {savedTag}
              </span>
              <span>
                {savedDate
                  ? new Date(savedDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`font-semibold text-sm shrink-0 ${
            isCredit ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isCredit ? "+" : "-"}₹{Number(savedAmount).toLocaleString("en-IN")}
        </span>
      </div>
    )
  }

  // --- STATE 1: INLINE QUICK-ADD FORM ---
  return (
    <form
      onSubmit={handleSubmit}
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="my-2 p-3 rounded-xl border  shadow-xs flex flex-col gap-2.5 select-none"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Expense / Credit Toggle */}
        <div className="flex h-8 rounded-md border bg-secondary/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTxType("expense")}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              txType === "expense"
                ? "bg-red-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setTxType("credit")}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              txType === "credit"
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Credit
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Chai & Samosa)"
          className="flex-1 min-w-[140px] h-8 text-sm bg-secondary/40 px-2.5 py-1.5 rounded-md border outline-none focus:border-primary"
        />

        {/* Amount */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹ Amount"
          className="w-28 h-8 text-sm bg-secondary/40 px-2.5 py-1.5 rounded-md border outline-none focus:border-primary"
        />

        {/* Tag */}
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag (e.g. Food)"
          className="w-28 h-8 text-sm bg-secondary/40 px-2.5 py-1.5 rounded-md border outline-none focus:border-primary"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-8 items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Add
        </button>
      </div>

      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </form>
  )
}

export const QuickAddBlock = createReactBlockSpec(
  {
    type: "quickAdd",
    propSchema: {
      isSaved: { default: "false" },
      title: { default: "" },
      amount: { default: "" },
      tag: { default: "" },
      txType: { default: "expense" },
      expenseDate: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => (
      <QuickAddView block={props.block} editor={props.editor} />
    ),
  }
)


/// This is the Tag ledger

import { TableElement , type Expenses } from "../v1/table"
import { Table2 } from "lucide-react"

function TagLedgerView({ block, editor }: { block: any; editor: any }) {
  const { expenses, refreshFinanceData } = useFinance()
  const { tag, filterType } = block.props

  const filteredExpenses = expenses.filter((item: any) => {
    const matchesTag =
      !tag.trim() ||
      String(item.tag ?? "")
        .toLowerCase()
        .trim()
        .includes(tag.toLowerCase().trim())

    const matchesType =
      filterType === "all" || item.type === filterType

    return matchesTag && matchesType
  })

  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="my-3 p-4 rounded-xl border  shadow-xs flex flex-col gap-4 select-none"
    >
      {/* Header Controls: Tag Filter & Type Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            value={tag}
            placeholder="Filter by tag (leave empty for all)..."
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { tag: e.target.value },
              })
            }
            className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-56"
          />
        </div>

        <div className="flex rounded-md border bg-secondary/40 p-0.5 text-xs">
          {(["all", "expense", "credit"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                editor.updateBlock(block, {
                  props: { filterType: mode },
                })
              }
              className={`px-2.5 py-1 rounded-sm capitalize font-medium transition-colors ${
                filterType === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Your Existing Table Component */}
      <TableElement
        expenses={filteredExpenses as Expenses[]}
        onChangeSuccess={refreshFinanceData}
        type={filterType === "credit" ? "credit" : "expense"}

      />
    </div>
  )
}

export const TagLedgerBlock = createReactBlockSpec(
  {
    type: "tagLedger",
    propSchema: {
      tag: { default: "" },
      filterType: { default: "all" },
    },
    content: "none",
  },
  {
    render: (props) => (
      <TagLedgerView block={props.block} editor={props.editor} />
    ),
  }
)
