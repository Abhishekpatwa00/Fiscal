"use client"

import { AddCsv } from "@/components/routes/v1/csv"
import { Button } from "@/components/ui/button"
import { AddExpense } from "@/components/routes/v1/add"
import { TableElement } from "@/components/routes/v1/table"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { AddStatement } from "@/components/routes/v1/statement"

type Expenses = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

export default function V1() {
  const supabase = createClient()

  const [expenses, setExpenses] = useState<Expenses[]>([])
  const [userId, setUserId] = useState<string | undefined>("")

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
      .select('id, user_id, title, amount, tag, expense_date')
      .eq('user_id', user)
      .order("expense_date", { ascending: false })

    if (!error && data) {
      setExpenses(data) // <-- Added this so the state actually updates!
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
        <div>
          <TableElement onChangeSuccess={getData} expenses={expenses} />
        </div>
      </div>
    </>
  )
}
