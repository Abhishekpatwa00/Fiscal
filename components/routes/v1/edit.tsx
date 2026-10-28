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
import { FormEvent, useState } from "react"

import { toast } from "../../ui/toast"
type Expenses = {
  title: string
  amount: number
  tag: string
  expense_date: string
}

type expParam = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}



export const EditExpense = ({ expense }: {  expense : expParam }) => {
  const supabase = createClient();

  const initialForm = {
    title: expense.title,
    amount: expense.amount,
    tag: expense.tag,
    expense_date: expense.expense_date,
  }
  const [expenses, setExpenses] = useState<Expenses>(initialForm)

  console.log(expenses)


  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = Object.fromEntries(formData as FormData)

    console.log(expenses.tag)
    const { error } = await supabase.from("expense").update({
      "title": expenses.title,
      "amount": expenses.amount,
      "tag": expenses.tag,
      "expense_date" : expenses.expense_date

    }).eq("user_id" , expense.user_id)
    if(error){
        console.log(error.message)
    } else {
      console.log("edit successFull")
    }

  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpenses({ ...expenses, [e.target.name]: e.target.value })
    console.log(expenses.tag)
  }

  return (
    <>
      <Sheet>
        <SheetTrigger render={
          <Button className={"w-30"} variant={"outline"}>Edit</Button>
        } />
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-lg">Add a new Expense</SheetTitle>
                      <SheetDescription>
                        Fill the details of your expense. Click save when you&apos;re done.
                      </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit}>
            <div className=" h-[80dvh] flex flex-col  flex-1 auto-rows-min">
              <div className="grid flex-1 auto-rows-min gap-6 px-4 ">

                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input onChange={handleChange} id="title" placeholder="Title" name="title" value={expenses.title} required  />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="amount">Amount</Label>
                    <Input onChange={handleChange} id="amount" required type="number" name="amount" value={expenses.amount} step="0.01" min="0"  placeholder="0.00" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="expenseDate">Expense Date</Label>
                    <Input onChange={handleChange} id="expenseDate" name="expense_date" value={expenses.expense_date ?? ""}  type="date" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tags">Tag</Label>
                    <Input onChange={handleChange} id="tags" placeholder="Tag" name="tag" value={expenses.tag ?? ""} required  />
                  </div>




              </div>
              <div className="align-bottom">
                <SheetFooter >
                          <Button type="submit"  >Save changes</Button>
                          <SheetClose render={<Button variant="outline">Close</Button>} />
                </SheetFooter>
              </div>

            </div>

          </form>
        </SheetContent>
      </Sheet>
    </>
  )

}
