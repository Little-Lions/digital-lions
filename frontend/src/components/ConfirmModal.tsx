import React, { useEffect, useRef } from 'react'
import Modal from './Modal'
import CustomButton from './CustomButton'
import ButtonGroup from './ButtonGroup'
import Text from './Text'
import AlertBanner from './AlertBanner'

interface ConfirmModalProps {
  title: string
  text: string
  onClose: () => void
  onAccept: () => void
  acceptText?: string
  closeText?: string
  isBusy?: boolean
  errorMessage?: string | null
  autoFocusAccept?: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  text,
  onClose,
  onAccept,
  acceptText = 'Yes',
  closeText = 'No',
  isBusy = false,
  errorMessage = '',
  autoFocusAccept = false,
}) => {
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    console.log('acceptButtonRef.current', acceptButtonRef.current)
    acceptButtonRef.current?.focus()
  }, [autoFocusAccept]) // Runs when modal opens and autoFocusAccept is true

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // cleanup event linstener after close
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <Modal
      title={title}
      acceptText={acceptText}
      isBusy={isBusy}
      footer={
        <>
          <ButtonGroup>
            <CustomButton
              label={closeText}
              variant="outline"
              onClick={onClose}
            />
            <CustomButton
              ref={acceptButtonRef}
              label={acceptText}
              variant="error"
              onClick={onAccept}
              isBusy={isBusy}
              isDisabled={!!errorMessage}
            />
          </ButtonGroup>
        </>
      }
    >
      <Text className="text-gray-700 ">{text}</Text>
      {errorMessage && (
        <AlertBanner
          variant="error"
          message={errorMessage}
          isCloseable={false}
        />
      )}
    </Modal>
  )
}

export default ConfirmModal
