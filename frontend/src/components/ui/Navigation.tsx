'use client'

import React, { useState } from 'react'
import NavLink from './NavLink'
import { usePathname } from 'next/navigation'
import NavigationButton from './NavigationButton'
import { useUser } from '@auth0/nextjs-auth0/client'

import { useCustomUser } from '@/context/UserContext'
import CustomButton from './CustomButton'
import SwitchImplementingPartnerDropDown from '../SwitchImplementingPartnerDropDown'

const Navigation: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { user } = useUser()
  const { customUser } = useCustomUser()

  const toggleMenu = (): void => {
    setMenuOpen((prev) => {
      if (!prev) setDropdownOpen(false)
      return !prev
    })
  }

  const toggleDropdown = (): void => {
    setDropdownOpen((prev) => {
      if (!prev) setMenuOpen(false)
      return !prev
    })
  }

  const closeMenu = (): void => {
    setMenuOpen(false)
  }

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true)
    try {
      setTimeout(() => {
        window.location.href = '/api/auth/logout'
      }, 10)
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  const handleLogin = async (): Promise<void> => {
    setIsLoggingIn(true)
    try {
      setTimeout(() => {
        window.location.href = '/api/auth/login'
      }, 10)
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoggingIn(false)
    }
  }

  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <nav className="bg-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex-1">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center ${
              !user ? 'justify-between w-full' : 'space-x-4'
            }`}
          >
            <>
              {/* Show Back Button on all pages except the home page (only when user is authenticated) */}
              {user && !isHomePage && (
                <NavigationButton
                  closeMenu={closeMenu}
                  useBackNavigation={true}
                  className="text-white hover:text-gray-900"
                />
              )}

              {/* Show Logo (Always show logo but disable the click when not authenticated) */}
              {isHomePage && (
                <NavLink
                  href="/"
                  className={`text-white font-bold text-xl leading-none ${
                    !user && 'pointer-events-none'
                  }`}
                >
                  Digital Lions
                </NavLink>
              )}

              {/* Conditionally show login button when user is not authenticated */}
              {!user && (
                <CustomButton
                  label="Login"
                  onClick={handleLogin}
                  variant="none"
                  className="text-white bg-gray-700 hover:bg-gray-600"
                  isBusy={isLoggingIn}
                />
              )}
            </>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-2 items-center">
            {/* Conditionally render navigation links if the user is authenticated */}
            {user && (
              <>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/program-tracker">Program tracker</NavLink>
                <NavLink href="/communities">Communities</NavLink>
                {customUser?.permissions.includes('users:write') && (
                  <NavLink href="/users">Users</NavLink>
                )}
                <SwitchImplementingPartnerDropDown
                  dropdownOpen={dropdownOpen}
                  toggleDropdown={toggleDropdown}
                />

                <CustomButton
                  label="Logout"
                  onClick={handleLogout}
                  variant="none"
                  className="text-white bg-gray-700 hover:bg-gray-600 py-0"
                  isBusy={isLoggingOut}
                />
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          {user && (
            <div className="flex items-center md:hidden gap-4">
              <div>
                <SwitchImplementingPartnerDropDown
                  dropdownOpen={dropdownOpen}
                  toggleDropdown={toggleDropdown}
                />
              </div>

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
                    {menuOpen ? (
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
            </div>
          )}
        </div>

        {/* Mobile Menu Links */}
        {menuOpen && (
          <>
            <div className="md:hidden absolute top-full left-0 bg-gray-800 rounded-b-lg w-full flex flex-col items-start shadow-lg">
              {user && (
                <>
                  <NavLink
                    href="/"
                    onClick={toggleMenu}
                    className="text-white py-4"
                  >
                    Home
                  </NavLink>
                  <NavLink
                    href="/program-tracker"
                    onClick={toggleMenu}
                    className="text-white py-4"
                  >
                    Program tracker
                  </NavLink>
                  <NavLink
                    href="/communities"
                    onClick={toggleMenu}
                    className="text-white py-4"
                  >
                    Communities
                  </NavLink>
                  {customUser?.permissions.includes('users:write') && (
                    <NavLink
                      href="/users"
                      onClick={toggleMenu}
                      className="text-white py-4"
                    >
                      Users
                    </NavLink>
                  )}
                  <NavigationButton
                    href="/api/auth/logout"
                    label="Logout"
                    variant="none"
                    className="text-white pt-4 !min-w-0 py-4"
                    closeMenu={toggleMenu}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navigation
