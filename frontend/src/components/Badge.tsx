import React, { ReactNode } from 'react'

// Define the possible variants
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning'
type BadgeSize = 'small' | 'medium' | 'large'

// Define the props interface
interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  children: ReactNode
}

// Map variants to corresponding classes
const badgeColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-light',
  secondary: 'bg-secondary text-text-light',
  success: 'bg-success text-text-light',
  error: 'bg-error text-text-light',
  warning: 'bg-warning text-text-light',
}

// Define size-specific styles
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
  const baseStyles = `block w-fit px-3 py-1 text-sm font-semibold rounded-full ${className}`
  const colorStyles = badgeColors[variant]
  const sizeStyles = badgeSizes[size]

  return (
    <span className={`${baseStyles} ${colorStyles} ${sizeStyles}`}>
      {children}
    </span>
  )
}

export default Badge
