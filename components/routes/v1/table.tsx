"use client"

import { useState, Dispatch, SetStateAction } from "react"
import { EditCsv } from "./edit-csv"
import { EditExpense } from "./edit"
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
import { toast } from "../../ui/toast"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { createClient } from "@/lib/supabase/client"
import { Button } from "../../ui/button"
import { DeleteIcon } from "lucide-react"

export type Expenses = {
  id: number | string
  user_id?: string
  title: string
  amount: number
  tag: string
  expense_date: string
  type:string
}

export type CsvExpense = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
   type:string
}

export const TableElement = ({
  onChangeSuccess,
  expenses,
  CsvExpense: csvExpenses,
  setCsvExpense,
  type
}: {
  onChangeSuccess?: () => void
  expenses?: Expenses[]
  CsvExpense?: CsvExpense[]
    setCsvExpense?: Dispatch<SetStateAction<CsvExpense[]>>,
  type?:string
}) => {
  const supabase = createClient()

  const activeList: (Expenses | CsvExpense)[] = expenses ?? csvExpenses ?? []

  // Helper that sorts newest-first (YYYY-MM-DD descending)
  const sortNewestFirst = <T extends { expense_date: string }>(list: T[]): T[] =>
    [...list].sort((a, b) => {
      const dateA = a.expense_date ? a.expense_date.split("T")[0] : ""
      const dateB = b.expense_date ? b.expense_date.split("T")[0] : ""
      return dateB.localeCompare(dateA)
    })

  const sortedList = sortNewestFirst(activeList)

  const totalAmount = sortedList.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  // --- PAGINATION LOGIC ---
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5
  const totalPages = Math.max(1, Math.ceil(sortedList.length / rowsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage

  const paginatedExpenses = expenses
    ? sortNewestFirst(expenses).slice(startIndex, endIndex)
    : undefined
  const paginatedCsv = csvExpenses
    ? sortNewestFirst(csvExpenses).slice(startIndex, endIndex)
    : undefined
  // ------------------------

  async function handleDelete(id: string | number) {
    const { error } = await supabase.from("expense").delete().eq("id", id)

    if (!error) {
      toast.add({
        type: "success",
        description: "The expense has been deleted.",
      })
      if (onChangeSuccess) onChangeSuccess()
    } else {
      toast.add({
        type: "error",
        description: "The delete was unsuccessful.",
        priority: "high",
      })
    }
  }

  const handleCsvDelete = (id: string | number) => {
    if (!setCsvExpense) return
    setCsvExpense((prev) => prev.filter((item) => item.id !== id))
  }

  const handleCsvUpdate = (updatedRow: CsvExpense) => {
    if (!setCsvExpense) return
    setCsvExpense((prev) =>
      prev.map((item) => (item.id === updatedRow.id ? updatedRow : item))
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full overflow-x-auto">
        <Table className="w-full min-w-[600px] max-w-3xl mx-auto">
          <TableCaption>A list of all your {!csvExpenses ? type == "credit" ? "credit" : "expense" : "transactions" }.</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead className="w-48 text-center">Title</TableHead>
              <TableHead className="w-48 text-center">Amount</TableHead>
              <TableHead className="w-48 text-center">Date</TableHead>
              <TableHead className="w-48 text-center">Tags</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {expenses
              ? paginatedExpenses?.map((expense) => {
                  return (
                    <TableRow key={expense.id} className="text-center">
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>{expense.amount}</TableCell>
                      <TableCell>{expense.expense_date}</TableCell>
                      <TableCell>{expense.tag}</TableCell>
                      <TableCell className="flex justify-center gap-1">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="destructive" className="w-8 h-8">
                                <DeleteIcon />
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the expense from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  handleDelete(expense.id)
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <EditExpense
                          onEdit={onChangeSuccess ?? (() => {})}
                          expense={
                            {
                              ...expense,
                              id: Number(expense.id),
                              user_id: expense.user_id ?? "",
                            } as any
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              : paginatedCsv?.map((expense) => {
                  return (
                    <TableRow key={expense.id} className="text-center">
                      <TableCell className="flex items-center gap-2 justify-center">{expense.title} {expense.type =="credit" ? <div className="w-3 h-3 rounded-full bg-green-500"></div> : <div className="w-3 h-3 rounded-full bg-red-500"></div>}</TableCell>
                      <TableCell>{expense.amount}</TableCell>
                      <TableCell>{expense.expense_date}</TableCell>
                      <TableCell>{expense.tag}</TableCell>
                      <TableCell className="flex justify-center gap-1">
                        <Button
                          variant="destructive"
                          onClick={() => handleCsvDelete(expense.id)}
                          className="w-8 h-8"
                        >
                          <DeleteIcon />
                        </Button>

                        <EditCsv
                          expense={{ ...expense, id: String(expense.id) } as any}
                          onUpdate={handleCsvUpdate as any}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={1} className="text-center font-bold">
                Total
              </TableCell>
              <TableCell colSpan={3}></TableCell>
              <TableCell className="text-center font-bold">
                {totalAmount.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between w-full max-w-3xl mx-auto px-2 gap-2">
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages} ({activeList.length} total items)
          </span>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  type="button"
                  variant={safePage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
