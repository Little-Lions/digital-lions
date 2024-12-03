import React from 'react'
import Modal from './Modal'
import CustomButton from './CustomButton'

interface ConfirmModalProps {
  title: string
  text: string
  onClose: () => void
  onAccept: () => void
  acceptText?: string
  closeText?: string
  isBusy?: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  text,
  onClose,
  onAccept,
  acceptText = 'Yes',
  closeText = 'No',
  isBusy = false,
}) => {
  return (
    <Modal
      title={title}
      acceptText={acceptText}
      isBusy={isBusy}
      footer={
        <>
          <CustomButton
            label={closeText}
            variant="outline"
            onClick={onClose}
            className="hover:text-gray-800 "
          />
          <CustomButton
            label={acceptText}
            variant="error"
            onClick={onAccept}
            isBusy={isBusy}
            className="ml-4 hover:text-white"
          />
        </>
      }
    >
      <p className="text-gray-700 ">{text}</p>
    </Modal>
  )
}

export default ConfirmModal
