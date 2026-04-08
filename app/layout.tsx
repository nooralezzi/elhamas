import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { getRequestLocale } from "@/lib/locale";
import { createSiteMetadata } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Arabic font - using Noto Sans Arabic for clean, modern look
// Only Regular is included; add Medium/SemiBold/Bold .woff2 files to public/fonts/ to enable more weights
const notoArabic = localFont({
  src: [
    {
      path: "../public/fonts/NotoSansArabic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createSiteMetadata(locale);
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6c0b16" },
    { media: "(prefers-color-scheme: dark)", color: "#8a1520" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoArabic.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
