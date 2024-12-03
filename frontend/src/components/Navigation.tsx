'use client'

import React, { useState } from 'react'
import NavLink from './NavLink'
import { usePathname } from 'next/navigation'
import BackButton from './BackButton'
import { useUser } from '@auth0/nextjs-auth0/client'

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()

  const logoutUrl = user?.sid
    ? // `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oidc/logout?client_id=${process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}&logout_hint=${
      //   user?.sid
      // }&returnTo=${encodeURIComponent(
      //   "http://localhost:3000/logout"
      // )}&federated`
      `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oidc/logout?client_id=${process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}&logout_hint=${user?.sid}&federated`
    : `/api/auth/logout`

  const toggleMenu = () => {
    setIsOpen((prevState) => !prevState)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto sm:px-4 flex-1">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center ${
              !user ? 'justify-between w-full' : 'space-x-4'
            }`}
          >
            <>
              {/* Show Back Button on all pages except the home page (only when user is authenticated) */}
              {user && !isHomePage && <BackButton closeMenu={closeMenu} />}

              {/* Show Logo (Always show logo but disable the click when not authenticated) */}
              {isHomePage && (
                <NavLink
                  href="/"
                  className={`text-white font-bold text-xl ${
                    !user && 'pointer-events-none'
                  }`}
                >
                  Digital Lions
                </NavLink>
              )}

              {/* Conditionally show login button when user is not authenticated */}
              {!user && (
                <NavLink
                  isExternal={true}
                  href="/api/auth/login"
                  onClick={toggleMenu}
                  className="text-white"
                >
                  Login
                </NavLink>
              )}
            </>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-4">
            {/* Conditionally render navigation links if the user is authenticated */}
            {user && (
              <>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/program-tracker">Program tracker</NavLink>
                <NavLink href="/communities">Communities / teams</NavLink>
                <NavLink href="/users">Users</NavLink>

                <NavLink isExternal={true} href={logoutUrl}>
                  Logout
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          {user && (
            <div className="md:hidden">
              <button
                data-collapse-toggle="navbar-hamburger"
                type="button"
                className="bg-white inline-flex items-center justify-center p-2 w-10 h-10 text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200   "
                aria-controls="navbar-hamburger"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Links (Full-Screen Overlay) */}
        {isOpen && (
          <div className="md:hidden pb-2 z-10 bg-gray-800 rounded-b-lg w-full flex left-0 flex-col absolute mt-4 space-y-2">
            {/* Conditionally render mobile menu links if the user is authenticated */}
            {user && (
              <>
                <NavLink
                  href="/"
                  onClick={toggleMenu}
                  className="text-white text-2xl py-4"
                >
                  Home
                </NavLink>
                <NavLink
                  href="/program-tracker"
                  onClick={toggleMenu}
                  className="text-white text-2xl py-4"
                >
                  Program tracker
                </NavLink>
                <NavLink
                  href="/communities"
                  onClick={toggleMenu}
                  className="text-white text-2xl py-4"
                >
                  Communities / teams
                </NavLink>
                <NavLink
                  href="/users"
                  onClick={toggleMenu}
                  className="text-white text-2xl py-4"
                >
                  Users
                </NavLink>
                <NavLink
                  href={logoutUrl}
                  isExternal={true}
                  onClick={toggleMenu}
                  className="text-white text-2xl py-4"
                >
                  Logout
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
