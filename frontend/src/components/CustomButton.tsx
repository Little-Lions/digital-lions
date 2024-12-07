'use client'

import React from 'react'

interface CustomButtonProps {
  label: string
  onClick?: () => void
  className?: string
  isBusy?: boolean
  isDisabled?: boolean
  isFullWidth?: boolean
  icon?: React.ReactNode
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
  className = '',
  isBusy = false,
  isDisabled = false,
  isFullWidth = false,
  icon,
  variant = 'primary',
  onClick,
}) => {
  let buttonClass =
    'relative px-3 py-2 rounded-lg text-sm inline-flex items-center justify-center'
  let buttonColorClass = ''
  let textColorClass = 'text-primary'
  let borderColorClass = 'border-transparent'

  switch (variant) {
    case 'primary':
      buttonColorClass = 'bg-button-primary hover:bg-primary-dark'
      textColorClass = 'text-primary-light'
      break
    case 'secondary':
      buttonColorClass = 'bg-button-secondary hover:bg-secondary-dark'
      textColorClass = 'text-primary-light'
      break
    case 'success':
      buttonColorClass = 'bg-button-success hover:bg-success-dark'
      textColorClass = 'text-primary-light'
      break
    case 'error':
      buttonColorClass = 'bg-button-error hover:bg-error-dark'
      textColorClass = 'text-primary-light'
      break
    case 'warning':
      buttonColorClass = 'bg-button-warning hover:bg-warning-dark'
      textColorClass = 'text-primary-light'
      break
    case 'outline':
      buttonClass += ' border'
      buttonColorClass = 'hover:bg-neutral-light'
      textColorClass = 'hover:text-gray-900'
      borderColorClass = 'border-neutral-500'
      break
    case 'none':
      buttonColorClass = ''
      break
    default:
      break
  }

  return (
    <button
      type="button"
      className={`${buttonClass} ${buttonColorClass} ${borderColorClass} ${
        isFullWidth ? 'w-full sm:w-auto' : ''
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${textColorClass} ${className}`}
      onClick={onClick}
      disabled={isBusy || isDisabled}
      style={{ minWidth: '6rem', minHeight: '2.5rem' }}
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
          {/* Render icon if provided */}
          {icon && <span className="h-4 w-4">{icon}</span>}
          <span>{label}</span>
        </div>
      )}
    </button>
  )
}

export default CustomButton
