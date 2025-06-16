import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GREAT IDEA - متتبع العملات الذكي",
  description: "نظام ذكي متقدم لتتبع وتحليل العملات المشفرة الجديدة من pump.fun مع خوارزمية فحص متطورة وذكاء اصطناعي",
  keywords: "GREAT IDEA, pump.fun, عملات جديدة, ذكاء اصطناعي, تحليل العملات, تعلم الآلة",
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
        <link rel="icon" href="/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
