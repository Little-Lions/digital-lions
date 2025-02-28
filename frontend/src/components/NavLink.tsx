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
  className = '',
  onClick,
  isExternal = false,
}) => {
  // Combine base classes
  const baseClasses =
    'text-white hover:bg-gray-700 relative px-3 py-2 rounded-lg text-sm inline-flex items-center justify-center min-h-[2.5rem]'

  // Merge className only if it exists
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses

  // Handle external links (such as Auth0 logout) with a regular <a> tag
  if (isExternal) {
    return (
      <Link
        prefetch={false}
        href={href}
        className={combinedClasses}
        onClick={onClick}
      >
        {children}
      </Link>
    )
  }

  // Default internal links
  return (
    <Link href={href} className={combinedClasses} onClick={onClick}>
      {children}
    </Link>
  )
}

export default NavLink
