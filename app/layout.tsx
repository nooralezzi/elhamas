import React from "react"
import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'

import './globals.css'

const tajawal = Tajawal({ 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal'
})

export const metadata: Metadata = {
  title: 'Elham Abu Sarhad for Umrah Services - Coming Soon',
  description: 'Professional Umrah and pilgrimage services. Coming soon.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${tajawal.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
