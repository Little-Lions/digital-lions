import React from 'react'
import clsx from 'clsx'

interface AlertBannerProps {
  message: string
  variant: 'info' | 'error' | 'success' | 'warning'
  isCloseable?: boolean
  onClose?: () => void
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  variant,
  isCloseable = true,
  onClose,
}) => {
  const variantClasses: Record<typeof variant, string> = {
    info: 'text-white bg-info border-info-dark',
    error: 'text-white bg-error border-error-dark',
    success: 'text-white bg-success border-success-dark',
    warning: 'text-white bg-warning border-warning-dark',
  }

  return (
    <div
      className={clsx(
        'flex items-center p-4 mb-2 border-t-4 rounded-md',
        variantClasses[variant],
      )}
      role="alert"
    >
      {/* Icon */}
      <svg
        className="flex-shrink-0 w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z" />
      </svg>

      {/* Message */}
      <div className="ml-3 text-sm font-medium">{message}</div>

      {/* Close Button */}
      {isCloseable && (
        <button
          type="button"
          className="ml-auto p-1.5 rounded-lg focus:ring-2 focus:outline-none"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            className="w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

export default AlertBanner
