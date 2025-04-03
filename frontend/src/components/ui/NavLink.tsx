import Link from 'next/link'
import clsx from 'clsx'

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
  const baseClasses =
    'text-white hover:bg-gray-700 relative px-3 py-2 rounded-lg text-sm inline-flex items-center justify-center'

  if (isExternal) {
    return (
      <a
        href={href}
        className={clsx(baseClasses, className)}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={clsx(baseClasses, className)}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default NavLink
