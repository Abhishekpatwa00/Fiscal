
import { SignUp } from "@/components/routes/auth/signup"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Signup() {

  const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If already logged in, send them straight to the dashboard
    if (user) {
      redirect("/")
    }



  return (
    <>
      <SignUp></SignUp>
      </>
  )
}
