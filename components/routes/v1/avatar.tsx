"use client"

import Link from "next/link"
import { useUser } from "@/components/context/user-context"
import { LogOut } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function UserAuthMenu() {
  const { user, loading, signOut } = useUser()

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" >
          <Link href="/login">Log in</Link>
        </Button>
        <Button size="sm">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "User"
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-2.5">
      <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full"><Avatar>
                <AvatarImage src={avatarUrl} alt="shadcn" />
          <AvatarFallback>{initials}</AvatarFallback>
              </Avatar></Button>} />
            <DropdownMenuContent className="w-32">


              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={signOut}>Log out</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>


    </div>
  )
}
