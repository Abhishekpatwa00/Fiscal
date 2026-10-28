"use client"



import {Button} from "@/components/ui/button"
import { AddExpense } from "@/components/routes/v1/add"
import { TableElement } from "@/components/routes/v1/table"
import { createClient } from "@/lib/supabase/client"
import { useEffect , useState } from "react"
import { redirect } from "next/navigation"

type Expenses = {
  id?: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
}




export default function V1  () {
  const supabase = createClient();

  const [expenses, setExpenses] = useState<Expenses[]>([]);




    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()


      return user?.id
    }

  async function getData() {
    const userId = await checkUser()
    console.log(userId)
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

  useEffect( () => {
    getData();
  }, [])



  async function userOut () {
    const { error } = await supabase.auth.signOut()
    if (error) console.log(error.message)
    return redirect("/")
  }


  return (

    <>
      <div className="flex flex-col   w-196 mx-auto gap-4">
        <div className="flex justify-end mr-4">
          <AddExpense onAddSuccess={getData}/>
        </div>
        <div >
          <TableElement expenses={expenses}></TableElement>
        </div>
        <Button onClick={userOut}>Log out</Button>
      </div>
    </>
  )
}
