"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function logOutUserAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error.message)
    return { status: "error", message: error.message }
  }

  redirect("/") // Automatically redirects to landing page and refreshes GetUser!
}
