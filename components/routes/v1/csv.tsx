"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { parseExpenseCsv } from "@/lib/parse-csv"
import { TableElement } from "./table"

type Expenses = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

export const AddCsv = () => {
  const supabase = createClient()

  // 1. Store the selected File object directly when the input changes
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expense, setExpense] = useState<Expenses[]>([])
  const [showReviewTable, setShowReviewTable] = useState(false)

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userId = await checkUser()
    if (!userId) {
      console.error("User not authenticated")
      return
    }

    // 2. Check our selectedFile state
    if (!selectedFile) {
      console.error("Please upload a valid file.")
      return
    }

    try {
      // 3. Parse the CSV
      const stagedRows = await parseExpenseCsv(selectedFile)

      setExpense(stagedRows)
      setShowReviewTable(true)
      console.log("Parsed rows:", stagedRows)

    } catch (err: any) {
      console.error("Parser Error:", err.message)
    }
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Add .csv</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg">Add a .csv file</SheetTitle>
          <SheetDescription>
            Browse and drag and drop your file. Click add when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="h-[80dvh] flex flex-col flex-1 auto-rows-min">
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <div className="grid gap-3">
                <Label htmlFor="file">Add your .csv</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".csv,text/csv"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setSelectedFile(file)
                  }}
                />
              </div>
            </div>
            <div className="align-bottom">
              <SheetFooter>
                <Button type="submit">Add</Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button type="submit"  className="w-full">
                        Review
                      </Button>
                    }
                  />
                  <AlertDialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Review the Expenses</AlertDialogTitle>
                      <AlertDialogDescription>
                        Verify the extracted rows below before saving them to your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* ✅ Place TableElement OUTSIDE of AlertDialogDescription! */}
                    <div className="my-4 overflow-x-auto">
                      <TableElement CsvExpense={expense} />
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Commit Expenses</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <SheetClose render={<Button variant="outline">Close</Button>} />
              </SheetFooter>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
