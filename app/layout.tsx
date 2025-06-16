import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GREAT - Crypto Analysis Platform",
  description: "AI-Powered Cryptocurrency Analysis Platform",
  keywords: "crypto, analysis, solana, pump.fun, trading, AI",
  authors: [{ name: "GREAT Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "GREAT - Crypto Analysis Platform",
    description: "AI-Powered Cryptocurrency Analysis Platform",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GREAT - Crypto Analysis Platform",
    description: "AI-Powered Cryptocurrency Analysis Platform",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="build-time" content={process.env.NEXT_PUBLIC_BUILD_TIME || "unknown"} />
        <meta name="version" content={process.env.NEXT_PUBLIC_VERSION || "1.0.0"} />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🚀 GREAT Platform Loaded');
              console.log('📅 Build Time:', '${process.env.NEXT_PUBLIC_BUILD_TIME || "unknown"}');
              console.log('🔢 Version:', '${process.env.NEXT_PUBLIC_VERSION || "1.0.0"}');
              
              // منع Cache في المتصفح
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
