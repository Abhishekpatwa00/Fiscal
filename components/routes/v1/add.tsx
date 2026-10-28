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



export const AddExpense = ({ onAddSuccess }: { onAddSuccess: () => void }) => {
  const supabase = createClient();

  const initialForm = {
    title: "",
    amount: "",
    tag: "",
    expense_date: "",
  }
  const [expense, setExpense] = useState<Expenses>(initialForm)

  const userId = "859484ce-e686-4861-af3d-e4d60e714850"



  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = Object.fromEntries(formData as FormData)
    console.log(data.title)

    const { error } = await supabase.from('expense').insert({
      user_id: userId,
      title: data.title,
      amount: data.amount,
      expense_date: data.expense_date,
      tag:data.tag
    })
    if (error) console.log(error)
    if (!error) {
      onAddSuccess(),
        toast.add({
          type: "success",
          description: "The expense have been addedd."
        })
      setExpense(initialForm)
    }







  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpense({ ...expense, [e.target.name]: e.target.value })
  }

  return (
    <>
      <Sheet>
        <SheetTrigger render={
          <Button variant={"outline"}>Add</Button>
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
                    <Input onChange={handleChange} id="title" placeholder="Title" name="title" value={expense.title} required  />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="amount">Amount</Label>
                    <Input onChange={handleChange} id="amount" required type="number" name="amount" value={expense.amount} step="0.01" min="0"  placeholder="0.00" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="expenseDate">Expense Date</Label>
                    <Input onChange={handleChange} id="expenseDate" name="expense_date" value={expense.expense_date}  type="date" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tags">Tag</Label>
                    <Input onChange={handleChange} id="tags" placeholder="Tag" name="tag" value={expense.tag} required  />
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
