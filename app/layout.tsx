import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Arabic font - using Noto Sans Arabic for clean, modern look
// Only Regular is included; add Medium/SemiBold/Bold .woff2 files to public/fonts/ to enable more weights
const notoArabic = localFont({
  src: [
    {
      path: '../public/fonts/NotoSansArabic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: 'Qafilat Al-Tawhid | Premium Hajj & Umrah Services',
    template: '%s | Qafilat Al-Tawhid',
  },
  description:
    'Experience the spiritual journey of a lifetime with our premium Hajj and Umrah services. Trusted pilgrimage packages, luxury accommodations, and expert guidance.',
  keywords: [
    'Hajj',
    'Umrah',
    'Pilgrimage',
    'Makkah',
    'Madinah',
    'Islamic Travel',
    'Saudi Arabia',
    'Holy Sites',
  ],
  authors: [{ name: 'Qafilat Al-Tawhid' }],
  creator: 'Qafilat Al-Tawhid',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: 'https://qafilat-altawhid.com',
    siteName: 'Qafilat Al-Tawhid',
    title: 'Qafilat Al-Tawhid | Premium Hajj & Umrah Services',
    description:
      'Experience the spiritual journey of a lifetime with our premium Hajj and Umrah services.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qafilat Al-Tawhid | Premium Hajj & Umrah Services',
    description:
      'Experience the spiritual journey of a lifetime with our premium Hajj and Umrah services.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6c0b16' },
    { media: '(prefers-color-scheme: dark)', color: '#8a1520' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoArabic.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
