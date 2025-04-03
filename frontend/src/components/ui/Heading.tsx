'use client'

import React from 'react'
import clsx from 'clsx'

interface HeadingProps {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'default'
  className?: string
  children: React.ReactNode
  hasNoMargin?: boolean
  onClick?: () => void
}

const Heading: React.FC<HeadingProps> = ({
  level = 'h1',
  className = '',
  children,
  hasNoMargin = false,
}) => {
  // Ensure the level is a valid HTML tag
  const Tag = level === 'default' ? 'span' : level

  const baseStyles = {
    h1: 'text-4xl md:text-5xl font-extrabold',
    h2: 'text-3xl md:text-4xl font-bold',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-medium',
    h5: 'text-lg md:text-xl font-medium',
    h6: 'text-base md:text-lg font-normal',
    default: 'text-base font-normal',
  }

  const marginStyles = {
    h1: 'mb-6',
    h2: 'mb-5',
    h3: 'mb-4',
    h4: 'mb-3',
    h5: 'mb-2',
    h6: 'mb-1',
    default: 'mb-1',
  }

  return (
    <Tag
      className={clsx(
        'inline-block',
        baseStyles[level],
        !hasNoMargin && marginStyles[level],
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export default Heading
