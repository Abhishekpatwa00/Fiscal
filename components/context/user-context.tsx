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
