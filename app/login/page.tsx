"use client"

import { Button } from "@/components/ui/button"
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
import { toast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string).trim()
    const password = formData.get("password") as string

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const message =
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message

      toast.add({ type: "error", description: message })
      setLoading(false)
      return
    }

    if (data.user) {
      toast.add({ type: "success", description: "Logged in successfully." })
      router.push("/dashboard")
      router.refresh()
    }
  }

  async function handleResetRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResetSent(false)

    const supabase = createClient()
    const formData = new FormData(e.currentTarget)
    const email = (formData.get("email") as string).trim()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
    })

    if (error) {
      toast.add({
        type: "error",
        description: error.message || "Could not send reset email.",
      })
      setLoading(false)
      return
    }

    setResetSent(true)
    toast.add({
      type: "success",
      description: "Password reset link sent. Check your inbox.",
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
              <CardTitle>
                {forgotMode ? "Reset your password" : "Login to your account"}
              </CardTitle>
              <CardDescription>
                {forgotMode
                  ? "Enter your email and we'll send you a reset link"
                  : "Enter your email below to login to your account"}
              </CardDescription>
              <CardAction>
                {forgotMode ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setForgotMode(false)
                      setResetSent(false)
                    }}
                  >
                    Back to Login
                  </Button>
                ) : (
                  <Button variant="link">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                )}
              </CardAction>
            </CardHeader>

            <form
              onSubmit={forgotMode ? handleResetRequest : handleLogin}
              className="flex gap-6 flex-col"
            >
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

                  {!forgotMode && (
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setForgotMode(true)}
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        required
                        disabled={loading}
                      />
                    </div>
                  )}

                  {forgotMode && resetSent && (
                    <p className="text-sm text-muted-foreground rounded-md border bg-muted/40 p-3">
                      If an account exists for that email, a password reset link
                      has been sent. Check your inbox and spam folder.
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {forgotMode ? "Sending link..." : "Logging in..."}
                    </>
                  ) : forgotMode ? (
                    "Send Reset Link"
                  ) : (
                    "Login"
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
