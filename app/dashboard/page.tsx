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
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import { ExpenseAnalytics } from "@/components/routes/v1/bar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const tableType = ["Expenses", "Credits"]

type Expenses = {
  id: number
  user_id: string
  title: string
  amount: number
  tag: string
  expense_date: string
  type: string
}

export default function V1() {
  const supabase = createClient()
 const [isOpen , setIsOpen] = useState<boolean>(true)
  const [selectedType, setSelectedType] = useState<string>("All")
  const [expenses, setExpenses] = useState<Expenses[]>([])


  const [userId, setUserId] = useState<string | undefined>("")
  const debitList = expenses.filter((item) => item.type !== "credit")
  const creditList = expenses.filter((item) => item.type === "credit")

  console.log(debitList)
  console.log(creditList)
  console.log(expenses)
  // Inside your V1 dashboard component:
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  // Automatically extract unique YYYY-MM months from your data (sorted newest first)
  const availableMonths = Array.from(
    new Set(
      expenses.map((item) => item.expense_date?.slice(0, 7)).filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a))

  // Filter transactions by selected month
  const filteredTransactions =
    selectedMonth === "all"
      ? expenses
      : expenses.filter((item) => item.expense_date?.startsWith(selectedMonth))

  const expenseLog = filteredTransactions.filter(
    (item) => item.type !== "credit"
  )
  const creditLog = filteredTransactions.filter(
    (item) => item.type === "credit"
  )
  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id
  }

  async function getData() {
    const user = await checkUser()
    setUserId(user)

    if (!user) return

    const { data, error } = await supabase
      .from("expense")
      .select("id, user_id, title, amount, tag, expense_date , type")
      .eq("user_id", user)
      .order("expense_date", { ascending: false })

    if (!error && data) {
      setExpenses(data)

      //clearAuthCookiesAtScopes<-- Added this so the state actually updates!
    }
  }

  useEffect(() => {
    getData()
  }, [])

  const currentList =
    selectedType === "Credits" ? creditLog
    : selectedType === "Expenses" ? expenseLog
        : filteredTransactions



  return (
    <>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16">
        {/* Top Bar: Month Filter on Left, Action Buttons on Right (stacks on mobile) */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label
              htmlFor="month-select"
              className="text-md font-medium whitespace-nowrap"
            >
              Period:
            </label>
            <div className="relative">
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ appearance: "none", WebkitAppearance: "none" }}
                className="h-9 rounded-md border border-input bg-background py-1 pl-3 pr-10 text-sm shadow-sm transition-colors duration-200 hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Time</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {new Date(`${month}-01T00:00:00`).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>

          </div>

          {/* Action Buttons wrap cleanly on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            <AddStatement onUploadSuccess={getData} />
            <AddCsv onUploadSuccess={getData} />
            <AddExpense onAddSuccess={getData} />
          </div>
        </div>

        {/* --- CHARTS & SUMMARY CARDS --- */}
        <ExpenseAnalytics
          transactions={filteredTransactions}
          selectedMonth={selectedMonth}
        />



        <div className="rounded-lg border bg-card transition-shadow duration-200 hover:shadow-md ">
          <div className="flex flex-col justify-between gap-3  sm:items-center">
            <div className="flex items-center gap-2 justify-between p-4 pr-8 w-full">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center p-4 text-left font-semibold transition-colors duration-200 hover:bg-accent/40"
              >

                  <span className="text-sm text-muted-foreground">
                    <ChevronDown
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-0" : "-rotate-180"
                      }`}
                    />

                </span>
                <span>
                  {selectedType}   ({currentList.length})
                </span>

              </button>

              <div className="flex items-center ">
                <label
                  htmlFor="select-type"
                  className="text-md pr-2 font-medium whitespace-nowrap"
                >

                </label>
                <div className="relative">
                  <select
                    id="table-type"
                    value={selectedType}
                    onChange={(e)=> setSelectedType(e.target.value)}
                    style={{ appearance: "none", WebkitAppearance: "none" }}
                    className="h-9 rounded-md border border-input bg-background py-1 pl-3 pr-10 text-sm shadow-sm transition-colors duration-200 hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="All">All</option>
                    {tableType.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
            {isOpen ?

              <div
                className={`grid pb-6 w-full transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <TableElement
                    onChangeSuccess={getData}
                    expenses={currentList}

                  />
                </div>
              </div>
              :
              <></>}

          </div>
        </div>
      </div>
    </>
  )
}
