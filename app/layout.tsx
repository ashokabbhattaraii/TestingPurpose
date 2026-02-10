import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WorkOps - Office Utility Management",
  description:
    "Centralized digital platform for office utility management, service requests, and facility coordination.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
