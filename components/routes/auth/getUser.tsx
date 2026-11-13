import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
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
import { User } from "lucide-react"
import SignOutBtn from "./signOutBtn"
import AuthNavWrapper from "./authnavwrapper"

export const GetUser = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <AuthNavWrapper>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={


              <Button variant="ghost" size="lg" className="rounded-full p-0 h-10 w-10">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User avatar" />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                </AvatarFallback>

                </Avatar>
            </Button>


            }
            />
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem><Link href="/billings">Billing</Link></DropdownMenuItem>
              <DropdownMenuItem><Link href="/settings">Settings</Link></DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SignOutBtn />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

    </AuthNavWrapper>
  )
}
