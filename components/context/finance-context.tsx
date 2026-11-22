"use client"

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

type Expense = {
  title: string
  amount: number | string
  tag: string
  expense_date: string
  type:string
}



type FinanceContextType = {
  expenses: Expense[]

  totalExpenses: number
  totalCredits: number
  netBalance: number
  loading: boolean
  refreshFinanceData: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {

  const supabase = createClient()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [credits, setCredits] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchFinanceData() {
    setLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()



    if (authError || !user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("expense")
      .select("*")
      .eq("user_id", user.id)


    if (data) setExpenses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchFinanceData()
  }, [])
  const totalExpenses = expenses.reduce((acc, curr) => {
    if (curr.type === "expense") {
      return acc + Number(curr.amount || 0)
    }
    return acc
  }, 0)

  const totalCredits = expenses.reduce((acc, curr) => {
    if (curr.type === "credit") {
      return acc + Number(curr.amount || 0)
    }
    return acc
  }, 0)

  const netBalance = totalCredits - totalExpenses

  return (
    <FinanceContext.Provider
          value={{
            expenses,

            totalExpenses,
            totalCredits,
            netBalance,
            loading,
            refreshFinanceData: fetchFinanceData,
          }}
        >
          {children}
        </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
