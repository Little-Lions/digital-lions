'use client'

import React, { ReactNode, useRef } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import '@/styles/globals.css'
import 'tailwindcss/tailwind.css'
import '@radix-ui/themes/styles.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'

import { CommunityProvider } from '@/context/CommunityContext'
import { QueryClient, QueryClientProvider } from 'react-query'

import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

interface LayoutProps {
  children: ReactNode
}

const queryClient = new QueryClient()

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null!)

  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <head>
        <title>Digital Lions</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icon.ico" />
        <meta
          name="description"
          content="Private web application of Little Lions Child Coaching"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-background-text">
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <CommunityProvider>
              <Navigation />
              <main className="flex-1">
                <div className="container mx-auto px-4 py-4 flex-1">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-start-1 lg:col-span-8 xl:col-span-6">
                      <div ref={wrapperRef}>{children}</div>
                    </div>
                  </div>
                </div>
              </main>
              <Footer />
            </CommunityProvider>
          </UserProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}

export default Layout
