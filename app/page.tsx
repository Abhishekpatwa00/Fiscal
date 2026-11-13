import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-24 text-center sm:gap-12">
        <h1 className="flex flex-col gap-4 text-3xl leading-tight sm:gap-6 sm:text-5xl">
          <span>
            Manage your{" "}
            <span className="font-[family-name:var(--font-peace-sans)]">
              Finance
            </span>
          </span>
          <span>Like Never Before</span>
        </h1>

        <Link href="/signup">
          <Button size="lg">Get Started</Button>
        </Link>
      </main>
    </div>
  )
}
