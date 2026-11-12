"use client"

import { AddCsv } from "@/components/routes/v1/csv"
import { Button } from "@/components/ui/button"
import { AddExpense } from "@/components/routes/v1/add"
import { TableElement } from "@/components/routes/v1/table"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { AddStatement } from "@/components/routes/v1/statement"
import { clearAuthCookiesAtScopes } from "@supabase/ssr"
import { ChevronDown, ChevronRight } from "lucide-react"

type Expenses = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
  type:string
}

export default function V1() {
  const supabase = createClient()
  const [isExpenseOpen, setIsExpenseOpen] = useState<boolean>(true)
  const [isCreditOpen, setIsCreditOpen] = useState<boolean>(true)

  const [expenses, setExpenses] = useState<Expenses[]>([])
  const [userId, setUserId] = useState<string | undefined>("")
  const debitList = expenses.filter((item) => item.type !== "credit")
  const creditList = expenses.filter((item) => item.type === "credit")
  console.log(debitList)
  console.log(creditList)
  console.log(expenses)
  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }

  async function getData() {
    const user = await checkUser()
    setUserId(user)

    if (!user) return

    const { data, error } = await supabase
      .from('expense')
      .select('id, user_id, title, amount, tag, expense_date , type')
      .eq('user_id', user)
      .order("expense_date", { ascending: false })

    if (!error && data) {
      setExpenses(data)
      //clearAuthCookiesAtScopes<-- Added this so the state actually updates!
    }
  }

  useEffect(() => {
    getData()
  }, [])



  return (
    <>
      <div className="flex flex-col w-196 mx-auto gap-4">
        <div className="flex justify-end gap-4 mr-4">
          <AddStatement onUploadSuccess={getData} />
          <AddCsv onUploadSuccess={getData} />
          <AddExpense onAddSuccess={getData} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-b-2 pb-4">
            <div className="flex gap-1  items-center">
              <Button variant={"ghost"} onClick={() => setIsCreditOpen(!isCreditOpen)}><ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                      isCreditOpen ? "rotate-180" : ""
                    }`}
              />
              <span className="text-lg font-[family-name:var(--font-peace-sans)]">Credit Log </span>

              </Button>

            </div>



            {isCreditOpen ?
              <TableElement onChangeSuccess={getData} expenses={creditList} type="credit" />
              :
              <></>
            }


          </div>
          <div className=" border-b-2 pb-4 mb-10">
            <div className="flex gap-1  items-center">
              <Button variant={"ghost"} onClick={() => setIsExpenseOpen(!isExpenseOpen)}><ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                      isExpenseOpen ? "rotate-180" : ""
                }`}

              />
                 <span className="text-lg font-[family-name:var(--font-peace-sans)]">Expense Log</span>
              </Button>

            </div>



            {isExpenseOpen ?
              <TableElement onChangeSuccess={getData} expenses={debitList} type="debit"/>
              :
              <></>
            }

          </div>

        </div>

      </div>
    </>
  )
}
