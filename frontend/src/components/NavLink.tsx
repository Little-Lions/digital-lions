import React from 'react'
import Link from 'next/link'

interface NavLinkProps {
  href?: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  isExternal?: boolean
}

const NavLink: React.FC<NavLinkProps> = ({
  href = '#',
  children,
  className,
  onClick,
  isExternal = false,
}) => {
  // Handle external links (such as Auth0 logout) with a regular <a> tag
  if (isExternal) {
    return (
      <Link
        prefetch={false}
        href={href}
        className={`${className} text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium ${className}`}
        onClick={onClick}
      >
        {children}
      </Link>
    )
  }

  // For internal links, use Next.js Link component
  return (
    <Link
      href={href}
      className={`${className} text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default NavLink
