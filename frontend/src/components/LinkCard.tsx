import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import Heading from './Heading'

interface LinkCardProps {
  title: string
  className?: string
  href: string
  onClick?: () => void
  children?: React.ReactNode
}

const LinkCard: React.FC<LinkCardProps> = ({
  title,
  className,
  href,
  onClick,
  children,
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg bg-card flex gap-2 items-center w-full p-5 font-medium text-white hover:bg-card-dark transition-colors',
        className,
      )}
      onClick={onClick}
    >
      {/* Title Section */}
      <Link href={href} className="flex-grow">
        <Heading level="h6" hasNoMargin>
          {title}
        </Heading>
        <div className="flex items-center gap-2">
          {children && <div>{children}</div>}
          {/* Chevron right icon */}
          <svg
            className="w-3 h-3 ml-auto transition-transform"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l4 4-4 4"
            />
          </svg>
        </div>
      </Link>
    </div>
  )
}

export default LinkCard
