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

export const AddCsv = ({ onUploadSuccess }: { onUploadSuccess?: () => void }) => {
  const supabase = createClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expense, setExpense] = useState<Expenses[]>([])
  const [showReviewTable, setShowReviewTable] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }

  // Step 1: Parse the CSV and ONLY open the dialog once parsing succeeds
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const userId = await checkUser()
    if (!userId) {
      console.error("User not authenticated")
      return
    }

    if (!selectedFile) {
      console.error("Please upload a valid file.")
      return
    }

    try {
      const stagedRows = await parseExpenseCsv(selectedFile)

      // Ensure every row has `id` so TableElement's key={expense.id} works!
      const formattedRows: Expenses[] = stagedRows.map((row: any, idx: number) => ({
        id: row.id || row.tempId || `csv-${Date.now()}-${idx}`,
        title: row.title,
        amount: row.amount,
        tag: row.tag,
        expense_date: row.expense_date,
      }))

      setExpense(formattedRows)
      setShowReviewTable(true) // Opens the AlertDialog cleanly!
      console.log("Parsed rows:", formattedRows)
    } catch (err: any) {
      console.error("Parser Error:", err.message)
    }
  }

  // Step 2: Insert the reviewed rows into Supabase when "Commit Expenses" is clicked
  const handleCommitExpenses = async () => {
    if (expense.length === 0) return
    setIsCommitting(true)

    const userId = await checkUser()
    if (!userId) {
      console.error("User not authenticated")
      setIsCommitting(false)
      return
    }

    // Remove temporary `id` and attach `user_id` for Supabase
    const payload = expense.map(({ id, ...rest }) => ({
      ...rest,
      user_id: userId,
    }))

    const { error } = await supabase.from("expense").insert(payload)

    if (error) {
      console.error("Failed to commit expenses:", error.message)
    } else {
      console.log("Successfully committed all CSV expenses!")
      setShowReviewTable(false)
      setExpense([])
      setSelectedFile(null)
      if (onUploadSuccess) onUploadSuccess() // Refreshes your dashboard!
    }

    setIsCommitting(false)
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline">Add .csv</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg">Add a .csv file</SheetTitle>
          <SheetDescription>
            Browse and drag and drop your file. Click Review when you&apos;re done.
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
                {/* Single submit button that parses the file and opens the review dialog */}
                <Button type="submit" className="w-full">
                  Parse & Review
                </Button>
                <SheetClose render={<Button variant="outline">Close</Button>} />
              </SheetFooter>
            </div>
          </div>
        </form>

        {/* Controlled AlertDialog: Only opens when showReviewTable is true */}
        <AlertDialog open={showReviewTable} onOpenChange={setShowReviewTable}>
          <AlertDialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Review the Expenses ({expense.length})</AlertDialogTitle>
              <AlertDialogDescription>
                Verify the extracted rows below before saving them to your account.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4 overflow-x-auto">
              <TableElement CsvExpense={expense} setCsvExpense={setExpense} />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCommitExpenses}
                disabled={isCommitting || expense.length === 0}
              >
                {isCommitting ? "Saving..." : "Commit Expenses"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
