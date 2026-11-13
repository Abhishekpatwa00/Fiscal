"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"


export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-8">
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

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">

        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out md:hidden ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b px-4 py-4">

          </div>
        </div>
      </div>
    </header>
  )
}
