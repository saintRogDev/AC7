import React from "react"
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ScrollToTop } from '@/components/scroll-to-top'
import './globals.css'

const _inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const _playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'AC7 Foundation | Ashton Carter Memorial Foundation',
  description: 'Honoring the life and legacy of Ashton Carter through education, leadership, and community impact. Supporting young people to reach their full potential.',
  keywords: ['memorial foundation', 'Ashton Carter', 'AC7', 'education', 'leadership', 'community', 'scholarship'],
  openGraph: {
    title: 'AC7 Foundation | Ashton Carter Memorial Foundation',
    description: 'Continuing his legacy through education, leadership, and community impact.',
    type: 'website',
  },
    generator: 'v0.app'
}

export const viewport = {
  themeColor: '#8B8B6E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ScrollToTop />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
