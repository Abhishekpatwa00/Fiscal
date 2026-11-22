"use client"

import { toast } from "@/components/ui/toast"
import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Loader2 } from "lucide-react"

export const SignUp = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setShowPopup(false)

    const supabase = createClient()
    const formData = new FormData(e.currentTarget)
    const enteredEmail = (formData.get("email") as string).trim()
    const password = formData.get("password") as string

    setEmail(enteredEmail)

    const { data, error } = await supabase.auth.signUp({
      email: enteredEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.add({
        type: "error",
        description: error.message || "Could not create account.",
        priority: "high",
      })
      setLoading(false)
      return
    }

    // Supabase returns an empty identities array if the email is already registered
    if (data.user && data.user.identities?.length === 0) {
      toast.add({
        type: "error",
        description: "An account with this email already exists. Try logging in.",
        priority: "high",
      })
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, session is active immediately
    if (data.session) {
      toast.add({
        type: "success",
        description: "Account created! Redirecting to dashboard...",
      })
      router.push("/dashboard")
      router.refresh()
      return
    }

    setShowPopup(true)
    toast.add({
      type: "success",
      description: "Verification email sent. Check your inbox.",
    })
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-dvh justify-between">
      <div className="lg:ml-12 md:ml-8 ml-4">
        <Link href="/" aria-label="Home">
          <img
            src="/dark-logo.png"
            alt="Fiscal logo"
            className="hidden w-28 dark:block sm:w-32"
          />
          <img
            src="/logo-transparent.png"
            alt="Fiscal logo"
            className="w-28 dark:hidden sm:w-32"
          />
        </Link>
      </div>

      <div className="flex items-center h-full justify-center">
        <div className="flex self-center p-4">
          <Card className="w-sm md:w-md">
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
              <CardAction>
                <Button variant="link">
                  <Link href="/login">Login</Link>
                </Button>
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
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      minLength={6}
                      type="password"
                      name="password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-4">
                {showPopup && (
                  <p className="text-sm text-muted-foreground rounded-md border bg-muted/40 p-3">
                    We&apos;ve sent a verification link to{" "}
                    <span className="font-semibold text-foreground">{email}</span>.
                    Click the link inside the email to activate your account.
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
