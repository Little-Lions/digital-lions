import TextInput from '@/components/ui/TextInput'
import Modal from '@/components/ui/Modal'
import AlertBanner from '@/components/ui/AlertBanner'

interface AddTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  isBusy: boolean
  isDisabled: boolean
  teamName: string
  onTeamNameChange: (value: string) => void
  onTeamNameBlur: (value: string) => void
  errorMessage?: string | null
}

const AddTeamModal: React.FC<AddTeamModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isBusy,
  isDisabled,
  teamName,
  onTeamNameChange,
  onTeamNameBlur,
  errorMessage,
}) => {
  if (!isOpen) return null

  return (
    <Modal
      onClose={onClose}
      title="Add Team"
      acceptText="Add"
      onAccept={onAccept}
      isBusy={isBusy}
      isDisabledButton={isDisabled}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onAccept()
        }}
      >
        <TextInput
          className="mb-2"
          label="Team name"
          value={teamName}
          onChange={onTeamNameChange}
          onBlur={onTeamNameBlur}
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

export default AddTeamModal
