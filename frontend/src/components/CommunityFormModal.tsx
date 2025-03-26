import Modal from './Modal'
import TextInput from './TextInput'
import AlertBanner from './AlertBanner'

interface CommunityFormModalProps {
  modalType: 'add' | 'edit' | null
  errorMessage: string | null
  communityName: string
  isAdding: boolean
  isEditing: boolean
  onAccept: () => void
  onClose: () => void
  onCommunityNameChange: (value: string) => void
  setErrorMessage: (msg: string | null) => void
}

const CommunityFormModal: React.FC<CommunityFormModalProps> = ({
  modalType,
  errorMessage,
  communityName,
  isAdding,
  isEditing,
  onAccept,
  onClose,
  onCommunityNameChange,
  setErrorMessage,
}) => {
  if (modalType !== 'add' && modalType !== 'edit') return null

  const isEdit = modalType === 'edit'
  const modalTitle = isEdit ? 'Edit Community' : 'Add Community'
  const acceptText = isEdit ? 'Edit' : 'Add'
  const isBusy = isEdit ? isEditing : isAdding

  return (
    <Modal
      onClose={onClose}
      title={modalTitle}
      acceptText={acceptText}
      onAccept={onAccept}
      isBusy={isBusy}
      isDisabledButton={!communityName}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!communityName.trim()) {
            setErrorMessage('Community name cannot be empty or spaces only')
            return
          }
          setErrorMessage(null)
          onAccept()
        }}
      >
        <TextInput
          className="mb-2"
          label="Community name"
          value={communityName}
          onChange={(e) => onCommunityNameChange(e)}
          onBlur={(e) => onCommunityNameChange(e)}
          autoFocus
        />
        {errorMessage && (
          <AlertBanner
            variant="error"
            message={errorMessage}
            isCloseable={false}
          />
        )}
      </form>
    </Modal>
  )
}

export default CommunityFormModal
