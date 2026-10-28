"use client"
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
import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { FormEvent } from "react"


export default function Signup() {


  async function handleSubmit (e:FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log(email,password)

    const { data, error } = await supabase.auth.signUp({
        email,
      password,
      options: {
           emailRedirectTo: 'https://example.com/welcome',
         },
      })

    console.log(error)
    if (!error) {
      console.log("user Signed in")
      return redirect("/dashboard")

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
