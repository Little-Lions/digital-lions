import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import Heading from './Heading'

import { ChevronRightIcon } from '@heroicons/react/24/solid'

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
    <Link href={href} prefetch={false} className="w-full" onClick={onClick}>
      <div
        className={clsx(
          'rounded-lg bg-card flex justify-between gap-2 items-center w-full p-5 font-medium text-white hover:bg-card-dark transition-colors',
          className,
        )}
      >
        {/* Title section */}
        <Heading level="h6" hasNoMargin>
          {title}
        </Heading>

        {/* Title Section */}

        <div className="flex items-center gap-2">
          {children && <div>{children}</div>}
          {/* Chevron right icon */}
          <ChevronRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

export default LinkCard
