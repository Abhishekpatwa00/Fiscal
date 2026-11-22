"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
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
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleUpdatePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast.add({ type: "error", description: "Passwords do not match." })
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.add({
        type: "error",
        description: error.message || "Could not update password.",
      })
      setLoading(false)
      return
    }

    toast.add({
      type: "success",
      description: "Password updated! Redirecting to dashboard...",
    })
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex h-dvh items-center justify-center p-4">
      <div className="lg:ml-12 md:ml-8 ml-4">

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

      </div>
      <Card className="w-sm md:w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            Enter your new password below to regain access to your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
