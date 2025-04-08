import React, { ReactNode } from 'react'
import clsx from 'clsx'

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning'
type BadgeSize = 'small' | 'medium' | 'large'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  children: ReactNode
}

const badgeColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-light',
  secondary: 'bg-secondary text-text-light',
  success: 'bg-success text-text-light',
  error: 'bg-error text-text-light',
  warning: 'bg-warning text-text-light',
}

const badgeSizes: Record<BadgeSize, string> = {
  small: 'text-xs px-2 py-0.5',
  medium: 'text-sm px-3 py-1',
  large: 'text-base px-4 py-1.5',
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
}) => {
  return (
    <span
      className={clsx(
        'block w-fit font-semibold rounded-full',
        badgeColors[variant],
        badgeSizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
