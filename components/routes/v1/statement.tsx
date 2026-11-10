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
import { TableElement } from "./table"

type Expenses = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

export const AddStatement = ({ onUploadSuccess }: { onUploadSuccess?: () => void }) => {
  const supabase = createClient()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expense, setExpense] = useState<Expenses[]>([])
  const [showReviewTable, setShowReviewTable] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedFile) return

    const userId = await checkUser()
    if (!userId) {
      console.error("User not authenticated")
      return
    }

    setIsParsing(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await fetch("/api/parse-statement", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to parse statement")

      const formattedRows: Expenses[] = data.rows.map((row: any, idx: number) => ({
        id: `stmt-${Date.now()}-${idx}`,
        title: row.title,
        amount: Number(row.amount) || 0,
        tag: row.tag,
        expense_date: row.expense_date,
      }))

      setExpense(formattedRows)
      setIsSheetOpen(false)     // Close the upload sheet
      setShowReviewTable(true)  // Open the review dialog
    } catch (err: any) {
      console.error("Statement Parser Error:", err.message)
    } finally {
      setIsParsing(false)
    }
  }

  const handleCommitExpenses = async () => {
    if (expense.length === 0) return
    setIsCommitting(true)

    const userId = await checkUser()
    if (!userId) {
      setIsCommitting(false)
      return
    }

    const payload = expense.map(({ id, ...rest }) => ({
      ...rest,
      user_id: userId,
    }))

    const { error } = await supabase.from("expense").insert(payload)

    if (!error) {
      setShowReviewTable(false)
      setExpense([])
      setSelectedFile(null)
      if (onUploadSuccess) onUploadSuccess()
    } else {
      console.error("Failed to commit expenses:", error.message)
    }

    setIsCommitting(false)
  }

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger render={<Button variant="outline">Upload Statement</Button>} />
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-lg">Upload Bank Statement</SheetTitle>
            <SheetDescription>
              Upload a PDF or image of your bank statement. AI will extract and categorize your expenses.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit}>
            <div className="h-[80dvh] flex flex-col flex-1 auto-rows-min">
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <div className="grid gap-3">
                  <Label htmlFor="statement">Bank Statement (PDF / Image)</Label>
                  <Input
                    id="statement"
                    name="statement"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
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
                  <Button type="submit" className="w-full" disabled={isParsing}>
                    {isParsing ? "Extracting with AI..." : "Parse & Review"}
                  </Button>
                  <SheetClose render={<Button variant="outline" type="button">Close</Button>} />
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
              <AlertDialogTitle>Review Extracted Expenses ({expense.length})</AlertDialogTitle>
              <div className="flex gap-1">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={"bg-black text-white hover:bg-black/40"}
                  onClick={handleCommitExpenses}
                  disabled={isCommitting || expense.length === 0}
                >
                  {isCommitting ? "Saving..." : "Commit Expenses"}
                </AlertDialogAction>
              </div>
            </div>
            <AlertDialogDescription>
              Verify the AI-extracted transactions below before saving them to your account.
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
