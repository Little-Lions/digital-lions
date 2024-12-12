import React from 'react'
import Link from 'next/link'

import Heading from './Heading'

interface LinkCardProps {
  title: string
  className?: string
  href: string
  state?: { communityName?: string | null; teamName?: string | null }
  children?: React.ReactNode
}

const LinkCard: React.FC<LinkCardProps> = ({
  title,
  className,
  href,
  state,
  children,
}) => {
  const handleClick = (): void => {
    if (state) {
      localStorage.setItem('linkCardState', JSON.stringify(state))
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      <div
        className={`${className} rounded-lg bg-card flex gap-2 items-center w-full p-5 font-medium text-white hover:bg-card-dark transition-colors cursor-pointer`}
      >
        {/* Title Section */}
        <div className="flex-grow">
          <Heading level="h6" hasNoMargin={true}>
            {title}
          </Heading>
        </div>

        {/* Divider */}
        {children && (
          <div className="border-l border-gray-300 h-auto min-h-[50px]"></div>
        )}

        {/* Children Section */}
        <div className="flex flex-col items-start gap-2">{children}</div>

        {/* Right Arrow */}
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
  )
}

export default LinkCard
