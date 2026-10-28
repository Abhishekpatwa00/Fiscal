import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <div className="flex flex-col gap-12">
          <div>
             <img src="/dark-logo.png" className="w-32 ml-8 mt-[-20] hidden dark:block" />
            <img src="/logo-transparent.png " className="w-32 ml-8 mt-[-20] dark:hidden" />

          </div>
          <div >
            <ThemeProvider>{children}</ThemeProvider>
            <Toaster/>
          </div>
        </div>

      </body>
    </html>
  )
}
