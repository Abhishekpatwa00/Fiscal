"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { logOutUserAction } from "./actions"

export default function SignOutBtn() {
  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={() => logOutUserAction()}
    >
      Log out
    </DropdownMenuItem>
  )
}
