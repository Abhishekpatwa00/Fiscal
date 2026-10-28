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
import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-features"
import { Button } from "../../ui/button"
import { MoreHorizontal } from "lucide-react"


type Expenses = {
  id?: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

const columnHelper = createColumnHelper<DataTableFeatures, Expenses>()


export const TableElement = ({ expenses }: { expenses: Expenses[] }) => {

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="flex">

      <Table className="w-3xl  mx-auto ">
        <TableCaption>A list of all your expenses.</TableCaption>

        <TableHeader>
          <TableRow>

            <TableHead className="w-48 text-center">Title</TableHead>
            <TableHead className="w-48 text-center">Amount</TableHead>
            <TableHead className="w-48 text-center">Expense Date</TableHead>
            <TableHead className="w-48 text-center">Tags</TableHead>
            <TableHead className=""></TableHead>

          </TableRow>

        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            return (
              <TableRow key={expense.id} className="text-center">
                <TableCell >{expense.title}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{expense.expense_date}</TableCell>
                <TableCell>{expense.tag}</TableCell>
                <TableCell>
                  <Button variant={"outline"} size={"icon-sm"}><MoreHorizontal/></Button>
                </TableCell>
              </TableRow>
            )
          })}

        </TableBody>
        <TableFooter>
                <TableRow >
            <TableCell colSpan={1} className="text-center font-bold">Total</TableCell>
            <TableCell colSpan={2}></TableCell>
                  <TableCell className="text-center ">{totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>

      </Table>
    </div>
  )
}
