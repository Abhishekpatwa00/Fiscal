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

type Credit = {
  id: string
  amount: number
  source: string
  date: string
}

type FinanceContextType = {
  expenses: Expense[]
  credits: Credit[]
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
    const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchFinanceData() {
    setLoading(true)
    const [expenseRes, creditRes] = await Promise.all([
          supabase.from("expenses").select("*"),
          supabase.from("credits").select("*"),
        ])

        if (expenseRes.data) setExpenses(expenseRes.data)
        if (creditRes.data) setCredits(creditRes.data)
        setLoading(false)
  }

  useEffect(() => {
    fetchFinanceData()

  }, [])

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const totalCredits = credits.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  const netBalance = totalCredits - totalExpenses

  return (
    <FinanceContext.Provider
          value={{
            expenses,
            credits,
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
