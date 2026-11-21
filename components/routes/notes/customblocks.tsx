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
      className="my-3 p-4 rounded-xl border w-full shadow-xs flex flex-col gap-3 select-none"
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
        className="my-2 px-3.5 py-2.5 rounded-lg border w-full  flex items-center justify-between gap-3 select-none"
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
      className="my-2 p-3 rounded-xl border w-full  shadow-xs flex flex-col gap-2.5 select-none"
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
      className="my-3 p-3 sm:p-4 rounded-xl border w-full max-w-full  shadow-xs flex flex-col gap-3 select-none"
    >
      {/* Header Controls: Tag Filter & Type Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Table2 className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            value={tag}
            placeholder="Filter by tag (all if empty)..."
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { tag: e.target.value },
              })
            }
            className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-full min-w-0"
          />
        </div>

        <div className="flex rounded-md border bg-secondary/40 p-0.5 text-xs shrink-0">
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

//
//
import { Users, X } from "lucide-react"

type Participant = {
  id: string
  name: string
  paid: boolean
}

function parseParticipants(raw: string): Participant[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function SplitBillView({ block, editor }: { block: any; editor: any }) {
  const { title, totalAmount, participants: rawParticipants } = block.props
  const [newPerson, setNewPerson] = useState("")

  const participants = parseParticipants(rawParticipants)
  const numericTotal = Math.max(Number(totalAmount) || 0, 0)
  const count = participants.length
  const perPerson = count > 0 ? numericTotal / count : 0

  const paidCount = participants.filter((p) => p.paid).length
  const collected = paidCount * perPerson
  const pending = Math.max(numericTotal - collected, 0)

  function updateParticipants(next: Participant[]) {
    editor.updateBlock(block, {
      props: { participants: JSON.stringify(next) },
    })
  }

  function handleAddPerson(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const trimmed = newPerson.trim()
    if (!trimmed) return

    updateParticipants([
      ...participants,
      { id: crypto.randomUUID(), name: trimmed, paid: false },
    ])
    setNewPerson("")
  }

  function togglePaid(id: string) {
    updateParticipants(
      participants.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p))
    )
  }

  function removePerson(id: string) {
    updateParticipants(participants.filter((p) => p.id !== id))
  }

  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="my-3 p-4 rounded-xl border w-full  shadow-xs flex flex-col gap-3 select-none"
    >
      {/* Header: Title & Total Bill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            value={title}
            placeholder="Split title (e.g. Picnic Dinner)"
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { title: e.target.value },
              })
            }
            className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-48"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Total: ₹</span>
          <input
            type="number"
            min="0"
            value={totalAmount}
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { totalAmount: e.target.value },
              })
            }
            className="w-24 font-semibold text-foreground bg-secondary/60 px-2 py-1 rounded border outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-2 text-xs bg-secondary/40 p-2.5 rounded-lg">
        <div>
          <span className="text-muted-foreground block">Per Person</span>
          <strong className="text-sm text-foreground">
            ₹{perPerson.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div>
          <span className="text-muted-foreground block">Settled</span>
          <strong className="text-sm text-emerald-600">
            ₹{collected.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div>
          <span className="text-muted-foreground block">Pending</span>
          <strong
            className={`text-sm ${
              pending > 0 ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            ₹{pending.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Participant Checklist */}
      <div className="flex flex-col h-8 gap-1.5">
        {participants.length === 0 ? (
          <p className="text-xs text-muted-foreground py-1">
            Add people below to split the bill.
          </p>
        ) : (
          participants.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border bg-background/60 text-sm"
            >
              <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={person.paid}
                  onChange={() => togglePaid(person.id)}
                  className="accent-emerald-600 h-4 w-4 cursor-pointer"
                />
                <span
                  className={`truncate ${
                    person.paid
                      ? "line-through text-muted-foreground"
                      : "font-medium"
                  }`}
                >
                  {person.name}
                </span>
              </label>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    person.paid
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-amber-500/15 text-amber-600"
                  }`}
                >
                  {person.paid
                    ? "Paid"
                    : `₹${perPerson.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}`}
                </span>
                <button
                  type="button"
                  onClick={() => removePerson(person.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                  aria-label={`Remove ${person.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Person Input */}
      <form onSubmit={handleAddPerson} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          placeholder="Add person name..."
          className="flex-1 h-8 text-xs bg-secondary/40 px-2.5 py-1.5 rounded-md border outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="inline-flex h-8 items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </form>
    </div>
  )
}

export const SplitBillBlock = createReactBlockSpec(
  {
    type: "splitBill",
    propSchema: {
      title: { default: "Group Expense" },
      totalAmount: { default: "0" },
      participants: {
        default: JSON.stringify([{ id: "me", name: "You", paid: true }]),
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <SplitBillView block={props.block} editor={props.editor} />
    ),
  }
)


//
// Wishlist block
//
//

import { ShoppingBag } from "lucide-react"

function WishlistView({ block, editor }: { block: any, editor: any }) {
  const { netBalance } = useFinance()
  const { item, price } = block.props
  const numericPrice = Math.max(Number(price) || 0, 0)
    const remainingBalance = netBalance - numericPrice
    const hasPrice = numericPrice > 0
    const canAfford = hasPrice && remainingBalance >= 0
  const shortfall = Math.max(numericPrice - netBalance, 0)
  const progressPercent = !hasPrice
      ? 0
      : canAfford
      ? Math.min(Math.round((numericPrice / Math.max(netBalance, 1)) * 100), 100)
      : Math.min(
          Math.round((Math.max(netBalance, 0) / numericPrice) * 100),
          100
      )
  return (
      <div
        contentEditable={false}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className="my-3 p-3 sm:p-4 rounded-xl border w-full max-w-full  shadow-xs flex flex-col gap-3 select-none"
      >
        {/* Header: Item Name & Price */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
            <input
              type="text"
              value={item}
              placeholder="Wishlist item (e.g. Ryzen 5 CPU)..."
              onChange={(e) =>
                editor.updateBlock(block, {
                  props: { item: e.target.value },
                })
              }
              className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-full min-w-0"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <span>Price: ₹</span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) =>
                editor.updateBlock(block, {
                  props: { price: e.target.value },
                })
              }
              className="w-24 font-semibold text-foreground bg-secondary/60 px-2 py-1 rounded border outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Affordability Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-secondary/40 p-2.5 rounded-lg">
          <div>
            <span className="text-muted-foreground block">Current Balance</span>
            <strong className="text-sm text-foreground">
              ₹{netBalance.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span className="text-muted-foreground block">After Purchase</span>
            <strong
              className={`text-sm ${
                !hasPrice
                  ? "text-muted-foreground"
                  : remainingBalance >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {hasPrice
                ? `₹${remainingBalance.toLocaleString("en-IN")}`
                : "—"}
            </strong>
          </div>

          <div className="flex sm:justify-end items-center">
            <span
              className={`px-2.5 py-1 rounded-full font-medium text-xs ${
                !hasPrice
                  ? "bg-secondary text-muted-foreground"
                  : canAfford
                  ? "bg-emerald-500/15 text-emerald-600"
                  : "bg-red-500/15 text-red-600"
              }`}
            >
              {!hasPrice
                ? "Enter price"
                : canAfford
                ? "Affordable"
                : `Short by ₹${shortfall.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {/* Impact / Readiness Bar */}
        {hasPrice && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>
                {canAfford
                  ? `Uses ${progressPercent}% of your net balance`
                  : `You have ${progressPercent}% of the price saved`}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  canAfford
                    ? progressPercent > 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
    </div>
  )

}

export const WishlistBlock = createReactBlockSpec(
  {
    type: "wishlist",
    propSchema: {
      item: { default: "" },
      price: { default: "0" },
    },
    content: "none",
  },
  {
    render: (props) => (
      <WishlistView block={props.block} editor={props.editor} />
    ),
  }
)

//Recurring Bill BlockN
//
import { CalendarClock, CheckCircle2, } from "lucide-react"

function RecurringBillView({ block, editor }: { block: any; editor: any }) {
  const supabase = createClient()
  const { refreshFinanceData } = useFinance()

  const { title, amount, dueDay, tag, lastPaidMonth } = block.props
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`
  const isPaidThisMonth = lastPaidMonth === currentMonthKey
  const numericAmount = Math.max(Number(amount) || 0, 0)

  async function handleLogPayment() {
    if (!title.trim() || numericAmount <= 0) {
      setErrorMsg("Enter a bill name and amount first.")
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

    const today = now.toISOString().split("T")[0]

    const { error } = await supabase.from("expense").insert({
      user_id: user.id,
      title: title.trim(),
      amount: numericAmount,
      tag: tag.trim() || "Bills",
      expense_date: today,
      type: "expense",
    })

    if (error) {
      setErrorMsg(error.message)
      setSubmitting(false)
      return
    }

    await refreshFinanceData()

    editor.updateBlock(block, {
      props: { lastPaidMonth: currentMonthKey },
    })

    setSubmitting(false)
  }

  return (
    <div
      contentEditable={false}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="my-3 p-3 sm:p-4 rounded-xl border w-full max-w-full  shadow-xs flex flex-col gap-3 select-none"
    >
      {/* Top Row: Bill Name + Status / Log Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <CalendarClock className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            value={title}
            placeholder="Bill name (e.g. Wi-Fi, Rent)..."
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { title: e.target.value },
              })
            }
            className="font-semibold text-sm bg-transparent border-b border-transparent focus:border-primary outline-none w-full min-w-0"
          />
        </div>

        {isPaidThisMonth ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-medium shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid this month
          </span>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleLogPayment}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Log Payment
          </button>
        )}
      </div>

      {/* Bottom Row: Amount, Due Day, Tag */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <label className="flex items-center justify-between sm:justify-start gap-2 bg-secondary/40 px-2.5 py-1.5 rounded-md">
          <span className="text-muted-foreground shrink-0">Amount: ₹</span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { amount: e.target.value },
              })
            }
            className="w-24 h-6 w-full font-semibold text-foreground bg-transparent outline-none text-right sm:text-left"
          />
        </label>

        <label className="flex items-center justify-between sm:justify-start gap-2 bg-secondary/40 px-2.5 py-1.5 rounded-md">
          <span className="text-muted-foreground shrink-0">Due Day:</span>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { dueDay: e.target.value },
              })
            }
            className="w-full font-semibold text-foreground bg-transparent outline-none text-right sm:text-left"
          />
        </label>

        <label className="flex items-center justify-between sm:justify-start gap-2 bg-secondary/40 px-2.5 py-1.5 rounded-md">
          <span className="text-muted-foreground shrink-0">Tag:</span>
          <input
            type="text"
            value={tag}
            placeholder="Bills"
            onChange={(e) =>
              editor.updateBlock(block, {
                props: { tag: e.target.value },
              })
            }
            className="w-full min-w-0 font-medium text-foreground bg-transparent outline-none text-right sm:text-left"
          />
        </label>
      </div>

      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  )
}

export const RecurringBillBlock = createReactBlockSpec(
  {
    type: "recurringBill",
    propSchema: {
      title: { default: "" },
      amount: { default: "0" },
      dueDay: { default: "1" },
      tag: { default: "Bills" },
      lastPaidMonth: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => (
      <RecurringBillView block={props.block} editor={props.editor} />
    ),
  }
)
