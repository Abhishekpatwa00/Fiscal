"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expense, setExpense] = useState<Expenses[]>([])
  const [showReviewTable, setShowReviewTable] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedFile) {
      console.error("Please upload a valid file.")
      return
    }

    // Immediately close the Sheet as soon as "Parse & Review" is clicked
    setIsSheetOpen(false)

    const userId = await checkUser()
    if (!userId) {
      console.error("User not authenticated")
      return
    }

    try {
      const stagedRows = await parseExpenseCsv(selectedFile)

      const formattedRows: Expenses[] = stagedRows.map((row: any, idx: number) => ({
        id: row.id || row.tempId || `csv-${Date.now()}-${idx}`,
        title: row.title,
        amount: row.amount,
        tag: row.tag,
        expense_date: row.expense_date,
      }))

      setExpense(formattedRows)
      setShowReviewTable(true)

    } catch (err: any) {
      console.error("Parser Error:", err.message)
    }
  }

  const handleCommitExpenses = async () => {
    if (expense.length === 0) return
    setIsCommitting(true)

    const userId = await checkUser()
    if (!userId) {
      console.error("User not authenticated")
      setIsCommitting(false)
      return
    }

    const payload = expense.map(({ id, ...rest }) => ({
      ...rest,
      user_id: userId,
    }))

    const { error } = await supabase.from("expense").insert(payload)

    if (error) {
      console.error("Failed to commit expenses:", error.message)
    } else {

      setShowReviewTable(false)
      setExpense([])
      setSelectedFile(null)
      if (onUploadSuccess) onUploadSuccess()
    }

    setIsCommitting(false)
  }

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                  <Button type="submit" className="w-full">
                    Parse & Review
                  </Button>
                  <SheetClose render={<Button variant="outline">Close</Button>} />
                </SheetFooter>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showReviewTable} onOpenChange={setShowReviewTable}>
        <AlertDialogContent className="w-7xl">
          <AlertDialogHeader>
            <div className="flex justify-between w-full">
              <AlertDialogTitle>Review the Expenses ({expense.length})</AlertDialogTitle>
              <div className="flex gap-1">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="text-white bg-black hover:bg-black/45"
                  onClick={handleCommitExpenses}
                  disabled={isCommitting || expense.length === 0}
                >
                  {isCommitting ? "Saving..." : "Commit Expenses"}
                </AlertDialogAction>
              </div>
            </div>

            <AlertDialogDescription>
              Verify the extracted rows below before saving them to your account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 overflow-x-auto">
            <TableElement CsvExpense={expense} setCsvExpense={setExpense} />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
