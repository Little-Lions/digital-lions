import React, { ReactNode } from 'react'
import Navigation from './Navigation'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-background-text">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-4 py-4 flex-1">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-start-1 lg:col-span-8 xl:col-span-6">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
