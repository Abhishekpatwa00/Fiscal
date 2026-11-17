import { Geist, Geist_Mono, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toast"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/routes/v1/sidebar"
import { Suspense } from "react"
import { NotesProvider } from "../../components/context/notes-context"
import { FinanceProvider } from "@/components/context/finance-context"
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <FinanceProvider>
      <NotesProvider>
        <div className="flex gap-16">
          <SidebarProvider>
            <Suspense>
              <AppSidebar />
            </Suspense>

            <main className="flex w-full flex-col items-center">
              <SidebarTrigger className="m-4 self-start" />
              {children}
            </main>
          </SidebarProvider>
        </div>
      </NotesProvider>
    </FinanceProvider>


  )
}
