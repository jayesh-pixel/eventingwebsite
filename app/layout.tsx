import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import ReduxProvider from '@/components/ReduxProvider'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import MaybeFooter from '@/components/MaybeFooter'
import { SITE_DESCRIPTION, SITE_NAME, SITE_PREVIEW_IMAGE, SITE_URL } from '@/lib/site'

// Site-wide defaults for the tab title and link previews; pages such as an event
// override the title, description and image with their own.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: SITE_PREVIEW_IMAGE, width: 1080, height: 1080, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_PREVIEW_IMAGE],
  },
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
            <main className="flex-1 pt-16 lg:pt-24">
              {children}
            </main>
            <MaybeFooter />
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}
