'use client'

import React, { ReactNode, useRef } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import '@/styles/globals.css'
import 'tailwindcss/tailwind.css'
import '@radix-ui/themes/styles.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'

import { CommunityProvider } from '@/context/CommunityContext'

import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null!)

  return (
    <html lang="en" className={poppins.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-background-text">
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
      </body>
    </html>
  )
}

export default Layout
