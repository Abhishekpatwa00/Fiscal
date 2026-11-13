import { Geist, Geist_Mono, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/routes/v1/sidebar"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

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

        <>
<div className="flex gap-16">

      <SidebarProvider>

        <AppSidebar />

          <main className="w-full flex flex-col items-center">
            <SidebarTrigger className="self-start m-4"/>
            {children}
          </main>

        </SidebarProvider>
</div>

        </>



  )
}
