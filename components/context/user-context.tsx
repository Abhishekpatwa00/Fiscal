"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"


type UserContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider ({children} : {children : React.ReactNode}) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const refreshUser = useCallback(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user ?? null)
        setLoading(false)
      }, [supabase])

      useEffect(() => {
        refreshUser()

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        })

        return () => {
          subscription.unsubscribe()
        }
      }, [supabase, refreshUser])

      const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push("/login")
        router.refresh()
      }

      return (
        <UserContext.Provider value={{ user, loading, signOut, refreshUser }}>
          {children}
        </UserContext.Provider>
      )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
