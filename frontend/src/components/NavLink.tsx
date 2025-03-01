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
  const baseClasses =
    'text-white hover:bg-gray-700 relative px-3 py-2 rounded-lg text-sm inline-flex items-center justify-center min-h-[2.5rem]'

  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses

  // Handle external links using <a> instead of <Link>
  if (isExternal) {
    return (
      <a
        href={href}
        className={combinedClasses}
        onClick={onClick}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  // Default internal links
  return (
    <Link href={href} className={combinedClasses}>
      {children}
    </Link>
  )
}

export default NavLink
