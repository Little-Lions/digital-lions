import React, { useEffect } from 'react'
import CustomButton from '../CustomButton'
import ReactDOM from 'react-dom'
import Heading from './Heading'

interface ModalProps {
  children: React.ReactNode
  onClose?: () => void
  onAccept?: () => void
  title: string
  acceptText?: string
  isBusy?: boolean
  footer?: React.ReactNode
  isDisabledButton?: boolean
}

const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
  onAccept,
  title,
  acceptText = 'Ok',
  isBusy = false,
  footer,
  isDisabledButton = false,
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const modalContent = (
    <div
      id="default-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <Heading level="h3" hasNoMargin={true}>
              {title}
            </Heading>
            {onClose && (
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
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
                <span className="sr-only">Close modal</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-4 md:p-5 space-y-4">{children}</div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b">
            {footer ||
              (onAccept && (
                <CustomButton
                  label={acceptText}
                  variant="secondary"
                  onClick={onAccept}
                  isBusy={isBusy}
                  isDisabled={isDisabledButton}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default Modal
