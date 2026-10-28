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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { createClient } from "@/lib/supabase/client"
import { type DataTableFeatures } from "./data-table-features"
import { Button } from "../../ui/button"
import { MoreHorizontal } from "lucide-react"
import { EditExpense } from "./edit"


type Expenses = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

const columnHelper = createColumnHelper<DataTableFeatures, Expenses>()


export const TableElement = ({ expenses }: { expenses: Expenses[] }) => {
  const supabase = createClient()
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  async function handleDelete (id:number) {
    const {error} = await supabase.from("expense").delete().eq('id',id)
  }
  const handleEdit = (id:number) => {
    return
  }

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
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline"><MoreHorizontal/></Button>} />
                        <DropdownMenuContent >
                          <DropdownMenuGroup className={"flex flex-col gap-1"}>
                            <DropdownMenuItem render={<Button onClick={()=> handleDelete(expense.id)} className={"w-30"} variant={"destructive"}>Delete</Button>}></DropdownMenuItem>
                            <EditExpense expense={expense}/>
                      </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
