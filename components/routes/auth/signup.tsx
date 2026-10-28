"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"

export const SignUp = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit (e:FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log(email, password)
    setEmail(email)
    setPassword(password)


    const { data, error } = await supabase.auth.signUp({
        email,
      password,
      options: {
           emailRedirectTo: 'https://localhost:3000',
         },
      })


    if (!error) {
      console.log("user Signed in")
      setShowPopup(true)



    }

  }
  return (
    <>
      <div>
        <Card className="w-md">
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Enter your email below to create your account
                </CardDescription>
                <CardAction>
              <Button variant="link" ><Link href="/login">Login</Link></Button>
                </CardAction>
          </CardHeader>
           <form onSubmit={handleSubmit} className="flex gap-6 flex-col">
              <CardContent>

                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        name="email"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>

                      </div>
                      <Input id="password" type="password" name="password" required />
                    </div>
                  </div>

              </CardContent>
            <CardFooter className="flex-col gap-2">
              {showPopup && <p className="text-sm text-gray-600">
                            We&aposve sent a verification link to <span className="font-semibold"><a href={email}>{email}</a></span>.
                            Click the link inside the email to activate your account. This window will log you in automatically once verified!
                          </p>}
                <Button type="submit" className="w-full">
                  SignUp
                </Button>
                <Button variant="outline" className="w-full">
                  SignUp with Google
                </Button>
          </CardFooter>
              </form>
            </Card>
      </div>

    </>
  )
}
