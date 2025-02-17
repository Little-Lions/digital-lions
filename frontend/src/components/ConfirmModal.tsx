import React from 'react'
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
}) => {
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
              label={acceptText}
              variant="error"
              onClick={onAccept}
              isBusy={isBusy}
              isDisabled={errorMessage !== ''}
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
