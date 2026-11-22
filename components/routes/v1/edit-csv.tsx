"use client"

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

export type CsvExpense = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
  type: string
}

export const EditCsv = ({
  expense,
  onUpdate,
}: {
  expense: CsvExpense
  onUpdate?: (updated: CsvExpense) => void
}) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CsvExpense>({
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    tag: expense.tag,
    expense_date: expense.expense_date,
    type: expense.type,
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setFormData({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        tag: expense.tag,
        expense_date: expense.expense_date,
        type: expense.type,
      })
    }
    setOpen(nextOpen)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (onUpdate) {
      onUpdate(formData)
    }
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-8 w-8">
            <Edit />
          </Button>
        }
      />

      <SheetContent className="flex h-dvh flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="text-lg">Edit Staged Expense</SheetTitle>
          <SheetDescription>
            Update the details of this CSV row. Click save when you&apos;re done.
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
                      formData.type === "expense"
                        ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === "expense"}
                      onChange={handleChange}
                      className="accent-red-500"
                    />
                    Expense (Debit)
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border p-2.5 text-sm font-medium transition-colors ${
                      formData.type === "credit"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="credit"
                      checked={formData.type === "credit"}
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
                  value={formData.title}
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
                  value={formData.amount === 0 ? "" : formData.amount}
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
                  value={formData.expense_date ?? ""}
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
                  value={formData.tag ?? ""}
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
