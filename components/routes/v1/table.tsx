"use client"
import { EditCsv } from "./edit-csv"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { createClient } from "@/lib/supabase/client"
import { Button } from "../../ui/button"
import { MoreHorizontal } from "lucide-react"
import { EditExpense } from "./edit"
import { useState } from "react"

type Expenses = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

type CsvExpense = {
  id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

export const TableElement = ( {onChangeSuccess ,expenses , CsvExpense }: { onChangeSuccess?: () => void , expenses?: Expenses[] , CsvExpense?:CsvExpense[] }) => {
  const supabase = createClient()



  const activeList = expenses ?? CsvExpense ?? []
  console.log(activeList)
    const totalAmount = activeList.reduce((sum, expense) => sum + Number(expense.amount), 0)


  async function handleDelete(id: number) {
    const { error } = await supabase.from("expense").delete().eq("id", id)

    if (!error) {
      toast.add({
        type: "success",
        description: "The expense has been deleted.",
      })
       if(onChangeSuccess) onChangeSuccess()
    } else {
      toast.add({
        type: "error",
        description: "The delete was unsuccessful.",
        priority: "high",
      })
    }
  }

  return (
    <div className="flex">
      <Table className="w-3xl mx-auto">
        <TableCaption>A list of all your expenses.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="w-48 text-center">Title</TableHead>
            <TableHead className="w-48 text-center">Amount</TableHead>
            <TableHead className="w-48 text-center">Expense Date</TableHead>
            <TableHead className="w-48 text-center">Tags</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {expenses ?  expenses.map((expense) => {
            return (
              <TableRow key={expense.id} className="text-center">
                <TableCell>{expense.title}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.expense_date}</TableCell>
                <TableCell>{expense.tag}</TableCell>
                <TableCell>
                  {/* 1. modal={false} disables the DropdownMenu's focus trap so the Sheet inputs can be typed in */}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="outline">
                          <MoreHorizontal />
                        </Button>
                      }
                    />
                    {/* 2. Stop keydown and focus events from bubbling back to the DropdownMenu */}
                    <DropdownMenuContent
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuGroup className="flex flex-col gap-1 p-1">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="destructive" className="w-full">
                                Delete
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                expense from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                handleDelete(expense.id)


                              }}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <EditExpense onEdit={onChangeSuccess} expenseParam={expense} />
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          }) : CsvExpense?.map((expense) => {

              return (
                <TableRow key={expense.id} className="text-center">
                  <TableCell>{expense.title}</TableCell>
                  <TableCell>{expense.amount}</TableCell>
                  <TableCell>{expense.expense_date}</TableCell>
                  <TableCell>{expense.tag}</TableCell>
                  <TableCell>
                    {/* 1. modal={false} disables the DropdownMenu's focus trap so the Sheet inputs can be typed in */}
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="outline">
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      {/* 2. Stop keydown and focus events from bubbling back to the DropdownMenu */}
                      <DropdownMenuContent
                        onKeyDown={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuGroup className="flex flex-col gap-1 p-1">
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button variant="destructive" className="w-full">
                                  Delete
                                </Button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  expense from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  handleDelete(expense.id)


                                }}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <EditCsv  expense={expense} />
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
  )
}
