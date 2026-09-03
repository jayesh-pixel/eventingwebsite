import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import ReduxProvider from '@/components/ReduxProvider'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import MaybeFooter from '@/components/MaybeFooter'

export const metadata: Metadata = {
  title: 'Eventing Website',
  description: 'Created with Prisha',
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head></head>
      <body className="bg-slate-950 text-white">
        <ReduxProvider>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1 pt-20 lg:pt-24">
              {children}
            </main>
            <MaybeFooter />
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}
