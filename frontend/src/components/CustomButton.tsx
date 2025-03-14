'use client'

import React from 'react'
import clsx from 'clsx'

interface CustomButtonProps {
  label: string
  onClick?: () => void
  className?: string
  isBusy?: boolean
  isDisabled?: boolean
  isFullWidth?: boolean
  icon?: React.ReactNode
  ref?: React.RefObject<HTMLButtonElement>
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
    | 'outline'
    | 'none'
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  className,
  isBusy = false,
  isDisabled = false,
  isFullWidth = false,
  icon,
  ref,
  variant = 'primary',
  onClick,
}) => {
  const baseClass =
    'relative px-3 py-2 rounded-lg text-sm inline-flex items-center justify-center min-w-[6rem] min-h-[2.5rem]'

  const variantClasses: Record<
    NonNullable<CustomButtonProps['variant']>,
    string
  > = {
    primary: 'bg-button-primary hover:bg-primary-dark text-primary-light',
    secondary: 'bg-button-secondary hover:bg-secondary-dark text-primary-light',
    success: 'bg-button-success hover:bg-success-dark text-primary-light',
    error: 'bg-button-error hover:bg-error-dark text-primary-light',
    warning: 'bg-button-warning hover:bg-warning-dark text-primary-light',
    outline:
      'border border-neutral-500 hover:bg-neutral-light hover:text-gray-600',
    none: '',
  }

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        baseClass,
        variantClasses[variant],
        isFullWidth && 'w-full sm:w-auto',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      onClick={onClick}
      disabled={isBusy || isDisabled}
      aria-busy={isBusy}
    >
      {isBusy ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="flex gap-1 items-center">
          {icon && <span className="h-4 w-4">{icon}</span>}
          <span>{label}</span>
        </div>
      )}
    </button>
  )
}

export default CustomButton
