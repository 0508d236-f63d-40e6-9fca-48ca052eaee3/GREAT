import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "متتبع العملات الجديدة من Pump.fun",
  description: "تتبع العملات المشفرة الجديدة المنشأة اليوم على منصة pump.fun مع البيانات المباشرة",
  keywords: "pump.fun, عملات جديدة, عملات مشفرة, solana, meme coins, العملات اليوم",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
