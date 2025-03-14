import React from 'react'
import clsx from 'clsx'

// Text variants
type TextVariant =
  | 'default'
  | 'primary'
  | 'primary-light'
  | 'secondary'
  | 'secondary-dark'
  | 'success'
  | 'success-dark'
  | 'error'
  | 'error-dark'
  | 'warning'
  | 'warning-dark'
  | 'info'
  | 'info-dark'

// Text sizes
type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Font weights
type TextWeight =
  | 'thin'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'

interface TextProps {
  variant?: TextVariant
  size?: TextSize
  weight?: TextWeight
  className?: string
  children: React.ReactNode
}

// Variant classes
const variantClasses: Record<TextVariant, string> = {
  default: 'text-gray-800',
  primary: 'text-primary',
  'primary-light': 'text-primary-light',
  secondary: 'text-secondary',
  'secondary-dark': 'text-secondary-dark',
  success: 'text-success',
  'success-dark': 'text-success-dark',
  error: 'text-error',
  'error-dark': 'text-error-dark',
  warning: 'text-warning',
  'warning-dark': 'text-warning-dark',
  info: 'text-info',
  'info-dark': 'text-info-dark',
}

// Size classes
const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

// Weight classes
const weightClasses: Record<TextWeight, string> = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
}

const Text: React.FC<TextProps> = ({
  variant = 'default',
  size = 'md',
  weight = 'normal',
  className,
  children,
}) => {
  return (
    <p
      className={clsx(
        'leading-relaxed',
        variantClasses[variant],
        sizeClasses[size],
        weightClasses[weight],
        className,
      )}
    >
      {children}
    </p>
  )
}

export default Text
