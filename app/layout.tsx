// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/lib/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Digital Land Portal',
  description: 'Land Registry System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>  {/* ← ADD THIS LINE */}
          {children}
          <Toaster />
        </LanguageProvider>  {/* ← AND THIS CLOSING TAG */}
      </body>
    </html>
  )
}