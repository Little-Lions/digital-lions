'use client'; // Add this line to make the component a Client Component

import React, { useState } from "react";
import NavLink from "./NavLink";
import { usePathname } from "next/navigation";
import BackButton from "./BackButton";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prevState) => !prevState);
  };

  const closeMenu = () => {
    setIsOpen(false); 
  };

  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Show Back Button on all pages except the home page */}
            {!isHomePage && <BackButton closeMenu={closeMenu} />}

            {/* Show Logo only on the home page */}
            {isHomePage && (
              <NavLink href="/" className="text-white font-bold text-xl">
                Digital Lions
              </NavLink>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/program-tracker">Program tracker</NavLink>
            <NavLink href="/communities">Communities / teams</NavLink>
            <NavLink href="/users">Users</NavLink>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              data-collapse-toggle="navbar-hamburger"
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 w-10 h-10 text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
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
        </div>

        {/* Mobile Menu Links (Full-Screen Overlay) */}
        {isOpen && (
          <div className="md:hidden pb-2 z-10 bg-gray-800 rounded-b-lg w-full flex left-0 flex-col absolute mt-4 space-y-2">
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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
