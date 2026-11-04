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
import { FormEvent, useState } from "react"

export type CsvExpense = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      // Keep amount as a number so the Table total calculation doesn't break!
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault() // 1. Stop the browser from refreshing the page!
    if (onUpdate) {
      onUpdate(formData) // 2. Send the updated row back to the parent state
    }
    setOpen(false) // 3. Close the edit sheet automatically
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="w-full">Edit</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg">Edit Staged Expense</SheetTitle>
          <SheetDescription>
            Update the details of this CSV row. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit}>
          <div className="h-[80dvh] flex flex-col flex-1 auto-rows-min">
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
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
                  value={formData.amount}
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

            <div className="align-bottom">
              <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose render={<Button type="button" variant="outline">Close</Button>} />
              </SheetFooter>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
