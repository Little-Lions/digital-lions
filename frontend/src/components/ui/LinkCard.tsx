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
    <Link href={href} prefetch={false} onClick={onClick}>
      <div
        className={clsx(
          'rounded-lg bg-card hover:bg-card-dark min-h-[2.5rem]',
          className,
        )}
      >
        <div className="p-4 flex items-center justify-between text-white font-medium">
          <Heading level="h6" hasNoMargin>
            {title}
          </Heading>

          {/* Title Section */}

          <div className="flex items-center gap-2">
            {children && <div>{children}</div>}
            <ChevronRightIcon className="w-4 h-4" />
          </div>
        </div>
        {/* Title section */}
      </div>
    </Link>
  )
}

export default LinkCard
