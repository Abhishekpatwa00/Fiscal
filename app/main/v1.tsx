"use client"



import { AddExpense } from "@/components/v1/add"
import { TableElement } from "@/components/v1/table"
import { supabase } from "@/lib/supabase/client"
import { useEffect , useState } from "react"

type Expenses = {
  id?: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}

export const V1 = () => {
  const userId = "859484ce-e686-4861-af3d-e4d60e714850"
  const [expenses, setExpenses] = useState<Expenses[]>([]);


  useEffect( () => {
    async function autoLoginForDev() {

      const { data: { session } } = await supabase.auth.getSession()


      if (!session) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: "user@test.com",
          password: "test@123",
        })
        console.log("AUTH ERROR:", authError?.message)
      }

      console.log(session?.user?.id)

    }

    async function getData() {
      await autoLoginForDev()

      const { data, error } = await supabase
        .from('expense')
        .select(`
          id,user_id,title,amount,tag,expense_date
        `)
        .eq('user_id', userId)

      console.log(data)
      if (data) {
        setExpenses(data)
      }
    }

    getData();

  }, [])


  return (

    <>
      <AddExpense/>
      <TableElement expenses={expenses}></TableElement>
    </>
  )
}
