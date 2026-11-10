import { Geist_Mono, Inter } from "next/font/google"
import localFont from "next/font/local"
import { GetUser } from "@/components/routes/auth/getUser"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const peaceSans = localFont({
  src: "./fonts/PeaceSans.otf", // Use "../../public/fonts/PeaceSans.otf" if layout.tsx is inside src/app/
  variable: "--font-peace-sans",
  display: "swap",
})

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
      className={cn(
        "antialiased font-sans",
        inter.variable,
        fontMono.variable,
        peaceSans.variable
      )}
    >
      <body>
        <ThemeProvider>
          <div className="flex flex-col gap-12">
            <div className="flex justify-between items-center mr-8">
              <img
                src="/dark-logo.png"
                alt="Logo"
                className="w-32 ml-8 -mt-5 hidden dark:block"
              />
              <img
                src="/logo-transparent.png"
                alt="Logo"
                className="w-32 ml-8 -mt-5 dark:hidden"
              />
              <GetUser />
            </div>
            <div>
              {children}
              <Toaster />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
