'use client'

import React, { useState, useEffect } from 'react'

import { TrashIcon, PencilIcon } from '@heroicons/react/16/solid'

import { useCommunity } from '@/context/CommunityContext'

import getCommunities from '@/api/services/communities/getCommunities'
import createCommunity from '@/api/services/communities/createCommunity'
import deleteCommunity from '@/api/services/communities/deleteCommunity'
import updateCommunity from '@/api/services/communities/updateCommunity'

import TextInput from '@/components/TextInput'
import ButtonGroup from '@/components/ButtonGroup'
import CustomButton from '@/components/CustomButton'
import LinkCard from '@/components/LinkCard'
import Modal from '@/components/Modal'
import SkeletonLoader from '@/components/SkeletonLoader'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'

interface Community {
  name: string
  id: number
}

const CommunityPage: React.FC = () => {
  const { communityName, setCommunityName } = useCommunity()
  const [communities, setCommunities] = useState<Community[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [communityId, setCommunityId] = useState<number | null>(null)

  const [isDeletingCommunity, setIsDeletingCommunity] = useState(false)
  const [isEditingCommunity, setIsEditingCommunity] = useState(false)
  const [isDeletingCommunityComplete, setIsDeletingCommunityComplete] =
    useState(false)

  const [isAddingCommunity, setIsAddingCommunity] = useState(false)
  const [isAddingCommunityComplete, setIsAddingCommunityComplete] =
    useState(false)
  const [openAddCommunityModal, setOpenAddCommunityModal] = useState(false)
  const [openEditCommunityModal, setOpenEditCommunityModal] = useState(false)

  const [deleteCommunityModalVisible, setDeleteCommunityModalVisible] =
    useState(false)

  const [errorMessage, setErrorMessage] = useState<string>('')

  const fetchCommunities = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const communitiesData = await getCommunities()
      setCommunities(communitiesData)
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const handleOpenCommunityModal = (): void => {
    setOpenAddCommunityModal(true)
  }

  const handleCloseCommunityModal = (): void => {
    setCommunityName('')
    setOpenAddCommunityModal(false)
  }

  const handleCommunityNameChange = (value: string): void => {
    setCommunityName(value)
  }

  const handleCommunityNameBlur = (value: string): void => {
    setCommunityName(value)
  }

  const handleAddCommunity = async (): Promise<void> => {
    if (!communityName || communityName.trim() === '') return

    setIsAddingCommunity(true)
    try {
      const newCommunity = await createCommunity(communityName)
      setCommunities([...communities, newCommunity]) // Update the local list
      // setCommunityName(newCommunity.name) // Update the context value
      handleCloseCommunityModal()

      await fetchCommunities() // Refetch the communities
      setIsAddingCommunityComplete(true)
    } catch (error) {
      setErrorMessage(String(error))
      console.error('Error adding community:', error)
    } finally {
      setIsAddingCommunity(false)
    }
  }

  const handleOpenDeleteCommunityModal = (CommunityId: number): void => {
    setCommunityId(CommunityId)
    setDeleteCommunityModalVisible(true)
  }

  const handleCloseDeleteCommunityModal = (): void => {
    setDeleteCommunityModalVisible(false)
  }

  const handleDeleteCommunity = async (): Promise<void> => {
    if (!communityId) return

    setIsDeletingCommunity(true)
    try {
      await deleteCommunity(communityId, false)
      handleCloseDeleteCommunityModal()

      await fetchCommunities()
      setIsDeletingCommunityComplete(true)
    } catch (error) {
      console.error('Failed to delete Community:', error)
    } finally {
      setIsDeletingCommunity(false)
    }
  }

  const handleOpenEditCommunityModal = (CommunityId: number): void => {
    setCommunityId(CommunityId)
    setOpenEditCommunityModal(true)
  }

  const handleCloseEditCommunityModal = (): void => {
    setOpenEditCommunityModal(false)
  }

  const handleEditCommunity = async (): Promise<void> => {
    if (!communityName || communityName.trim() === '') return
    if (!communityId) return

    setIsEditingCommunity(true)
    try {
      await updateCommunity(communityId, communityName)
      await createCommunity(communityName)

      handleCloseEditCommunityModal()

      await fetchCommunities()
      setIsAddingCommunityComplete(true)
    } catch (error) {
      setErrorMessage(String(error))
      console.error('Error adding community:', error)
    } finally {
      setIsEditingCommunity(false)
    }
  }

  return (
    <>
      {isLoading && isInitialLoad ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          <CustomButton
            label="Add Community"
            onClick={handleOpenCommunityModal}
            variant="outline"
            isFullWidth
            className="hover:bg-card-dark hover:text-white mb-4"
          />
          {communities.map((community) => (
            <LinkCard
              key={community.id}
              title={community.name}
              href={`/communities/${community.id}/teams`}
              onClick={() => setCommunityName(community.name)}
              className="mb-2"
            >
              {/* Edit and Delete Buttons */}
              <ButtonGroup>
                <CustomButton
                  label="Edit"
                  variant="secondary"
                  icon={<PencilIcon />}
                  onClick={() => {
                    handleOpenEditCommunityModal(community.id)
                  }}
                />
                <CustomButton
                  label="Delete"
                  variant="error"
                  icon={<TrashIcon />}
                  onClick={() => handleOpenDeleteCommunityModal(community.id)}
                />
              </ButtonGroup>
            </LinkCard>
          ))}

          {openAddCommunityModal && (
            <Modal
              onClose={handleCloseCommunityModal}
              title="Add Community"
              acceptText="Add"
              onAccept={handleAddCommunity}
              isBusy={isAddingCommunity}
              isDisabledButton={!communityName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddCommunity()
                }}
              >
                <TextInput
                  className="mb-2"
                  label="Community name"
                  value={communityName || ''} // Controlled input
                  onChange={handleCommunityNameChange}
                  onBlur={handleCommunityNameBlur}
                  autoFocus
                />
                {errorMessage && <p className="text-error">{errorMessage}</p>}
              </form>
            </Modal>
          )}

          {openEditCommunityModal && (
            <Modal
              onClose={handleCloseEditCommunityModal}
              title="Edit Community"
              acceptText="Edit"
              onAccept={handleEditCommunity}
              isBusy={isEditingCommunity}
              isDisabledButton={!communityName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleEditCommunity()
                }}
              >
                <TextInput
                  className="mb-2"
                  label="Community name"
                  value={communityName || ''} // Controlled input
                  onChange={handleCommunityNameChange}
                  onBlur={handleCommunityNameBlur}
                  autoFocus
                />
                {errorMessage && <p className="text-error">{errorMessage}</p>}
              </form>
            </Modal>
          )}

          {deleteCommunityModalVisible && (
            <ConfirmModal
              title="Delete community"
              text="Are you sure you want to delete this community?"
              onAccept={handleDeleteCommunity}
              onClose={handleCloseDeleteCommunityModal}
              acceptText="Delete"
              closeText="Cancel"
              isBusy={isDeletingCommunity}
            />
          )}

          {isAddingCommunityComplete && (
            <Toast
              variant="success"
              message="Community added successfully"
              isCloseable
              onClose={() => setIsAddingCommunityComplete(false)}
            />
          )}

          {isDeletingCommunityComplete && (
            <Toast
              variant="success"
              message="Community deleted successfully"
              isCloseable
              onClose={() => setIsDeletingCommunityComplete(false)}
            />
          )}
        </>
      )}
    </>
  )
}

export default CommunityPage
