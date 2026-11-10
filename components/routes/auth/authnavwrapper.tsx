"use client"

import { usePathname } from "next/navigation"

export default function AuthNavWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Hide navbar actions on login and signup routes
  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  return <>{children}</>
}
