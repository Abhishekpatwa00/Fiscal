"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Edit } from "lucide-react"
import { FormEvent, useState } from "react"
import { toast } from "../../ui/toast"

type Expenses = {
  title: string
  amount: number | string
  tag: string
  expense_date: string
  type: string
}

type expParam = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
  type: string
}

export const EditExpense = ({
  onEdit,
  expense,
}: {
  onEdit: () => void
  expense: expParam
}) => {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expenses>({
    title: expense.title,
    amount: expense.amount,
    tag: expense.tag,
    expense_date: expense.expense_date,
    type: expense.type,
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setExpenses({
        title: expense.title,
        amount: expense.amount,
        tag: expense.tag,
        expense_date: expense.expense_date,
        type: expense.type,
      })
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from("expense")
      .update({
        title: expenses.title,
        amount: parseFloat(String(expenses.amount)) || 0,
        tag: expenses.tag,
        expense_date: expenses.expense_date,
        type: expenses.type,
      })
      .eq("id", expense.id)
      .eq("user_id", expense.user_id)

    if (error) {
      toast.add({
        type: "error",
        description: "The edit was unsuccessful.",
        priority: "high",
      })
    } else {
      toast.add({
        type: "success",
        description: "The expense has been edited.",
      })
      onEdit()
      setOpen(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpenses({ ...expenses, [e.target.name]: e.target.value })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button className="h-8 w-8" variant="outline">
            <Edit />
          </Button>
        }
      />

      <SheetContent className="flex h-dvh flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-lg">Edit Expense</SheetTitle>
          <SheetDescription>
            Update the details of your expense. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <div className="grid gap-4 pb-4">
              <div className="grid gap-3">
                <Label>Transaction Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2.5 text-sm font-medium transition-colors ${
                      expenses.type === "expense"
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={expenses.type === "expense"}
                      onChange={handleChange}
                      className="accent-red-500"
                    />
                    Expense (Debit)
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2.5 text-sm font-medium transition-colors ${
                      expenses.type === "credit"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="credit"
                      checked={expenses.type === "credit"}
                      onChange={handleChange}
                      className="accent-emerald-500"
                    />
                    Credit (Income)
                  </label>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  onChange={handleChange}
                  id="title"
                  placeholder="Title"
                  name="title"
                  value={expenses.title}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  onChange={handleChange}
                  id="amount"
                  required
                  type="number"
                  name="amount"
                  value={expenses.amount === 0 ? "" : expenses.amount}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="expenseDate">Expense Date</Label>
                <Input
                  onChange={handleChange}
                  id="expenseDate"
                  name="expense_date"
                  value={expenses.expense_date ?? ""}
                  type="date"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="tags">Tag</Label>
                <Input
                  onChange={handleChange}
                  id="tags"
                  placeholder="Tag"
                  name="tag"
                  value={expenses.tag ?? ""}
                  required
                />
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0">
            <Button type="submit">Save changes</Button>
            <SheetClose
              render={
                <Button type="button" variant="outline">
                  Close
                </Button>
              }
            />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
