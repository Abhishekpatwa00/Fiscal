"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { useUser } from "@/components/context/user-context"
import {
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  FileText,
  FolderTree,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"

const features = [
  {
    icon: Wallet,
    title: "Credits & Expenses",
    description:
      "Log every inflow and outflow with tags, dates, and instant net balance calculations.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description:
      "Spot spending trends with interactive area charts, monthly bars, and category pie breakdowns.",
  },
  {
    icon: FolderTree,
    title: "Infinite Nested Notes",
    description:
      "Organize budgets, plans, and financial docs in a Notion-style recursive tree right beside your numbers.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Recoverable",
    description:
      "Secured with Row-Level Security and a smart Recycle Bin that keeps parent-child note hierarchies intact.",
  },
]

export default function Page() {
  const { user } = useUser()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 mt-[-20] ">
        {/* --- HERO SECTION --- */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>Personal Finance + Workspace Notes</span>
          </div>

          <h1 className="flex flex-col gap-2 text-4xl font-semibold tracking-tight sm:gap-3 sm:text-6xl">
            <span>
              Manage your{" "}
              <span className="font-[family-name:var(--font-peace-sans)] font-normal">
                Finance
              </span>
            </span>
            <span className="text-muted-foreground">Like Never Before</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm text-muted-foreground sm:text-base">
            Track credits, monitor expenses, and write nested financial notes in
            one distraction-free workspace built for clarity.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Enter Fiscal
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* --- STYLIZED WORKSPACE PREVIEW --- */}
          <div className="mt-16 w-full max-w-4xl overflow-hidden rounded-xl border bg-card text-left shadow-xl">
            {/* Fake Window Topbar */}
            <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                fiscal / dashboard
              </span>
              <div className="w-10" />
            </div>

            {/* Preview Body */}
            <div className="grid grid-cols-1 md:grid-cols-4">
              {/* Mock Sidebar */}
              <div className="hidden border-r bg-muted/20 p-4 md:block">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Workspace
                </p>
                <div className="space-y-1 text-xs">
                  <div className="rounded-md bg-secondary px-2.5 py-1.5 font-medium">
                    Overview
                  </div>
                  <div className="px-2.5 py-1.5 text-muted-foreground">
                    Credits
                  </div>
                  <div className="px-2.5 py-1.5 text-muted-foreground">
                    Expenses
                  </div>
                </div>

                <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <FileText className="h-3 w-3" />
                    <span>Monthly Budget</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-5 py-1">
                    <FileText className="h-3 w-3" />
                    <span>Rent &amp; Utilities</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <FileText className="h-3 w-3" />
                    <span>PC Build Plan</span>
                  </div>
                </div>
              </div>

              {/* Mock Main Content */}
              <div className="col-span-3 p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background p-3.5">
                    <p className="text-[11px] text-muted-foreground">
                      Net Balance
                    </p>
                    <p className="mt-1 text-lg font-semibold">₹42,850</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3.5">
                    <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <ArrowDownLeft className="h-3 w-3" />
                      Total Credits
                    </p>
                    <p className="mt-1 text-lg font-semibold">₹65,000</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3.5">
                    <p className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                      <ArrowUpRight className="h-3 w-3" />
                      Total Expenses
                    </p>
                    <p className="mt-1 text-lg font-semibold">₹22,150</p>
                  </div>
                </div>

                {/* Mock Bar Chart */}
                <div className="mt-4 rounded-lg border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium">
                      Cash Flow Overview
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Last 6 months
                    </span>
                  </div>
                  <div className="flex h-28 items-end justify-between gap-2 pt-2">
                    {[45, 70, 52, 85, 62, 92].map((height, i) => (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-center gap-1.5"
                      >
                        <div
                          style={{ height: `${height}%` }}
                          className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="border-t bg-muted/20 py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Built to replace scattered spreadsheets and disconnected note
                apps with one cohesive system.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border bg-card p-6 transition-colors hover:border-foreground/20"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* --- BOTTOM CTA --- */}
        <section className="border-t py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to take control of your workspace?
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Start logging transactions and organizing your financial notes in
              under a minute.
            </p>
            <div className="mt-7">
              <Link href={user ? "/dashboard" : "/signup"}>
                <Button size="lg" className="gap-2">
                  {user ? "Go to Dashboard" : "Create Free Account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row">
          <span className="font-medium text-foreground">Fiscal</span>
          <span>© {new Date().getFullYear()} Fiscal. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
