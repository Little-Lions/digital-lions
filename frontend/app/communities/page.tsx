'use client'

import React, { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from 'react-query'

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
import AlertBanner from '@/components/AlertBanner'
import Text from '@/components/Text'

import { Community } from '@/types/community.interface'

const CommunityPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { communityName, setCommunityName } = useCommunity()

  const [communityId, setCommunityId] = useState<number | null>(null)

  const [isDeletingCommunityComplete, setIsDeletingCommunityComplete] =
    useState<boolean>(false)
  const [isEditingCommunityComplete, setIsEditingCommunityComplete] =
    useState<boolean>(false)
  const [isAddingCommunityComplete, setIsAddingCommunityComplete] =
    useState<boolean>(false)

  const [openAddCommunityModal, setOpenAddCommunityModal] =
    useState<boolean>(false)
  const [openEditCommunityModal, setOpenEditCommunityModal] =
    useState<boolean>(false)

  const [deleteCommunityModalVisible, setDeleteCommunityModalVisible] =
    useState<boolean>(false)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const fetchCommunities = async (): Promise<Community[]> => {
    try {
      const response = await getCommunities()
      return response
    } catch (error) {
      console.error('Failed to fetch communities:', error)
      throw error
    }
  }

  const {
    data: communities = [], // Data from the query
    isLoading, // Loading state
    error: hasErrorFetchingCommunities, // Error state
  } = useQuery<Community[]>('communities', fetchCommunities, {
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  })

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

  const addCommunity = async (): Promise<{ id: number }> => {
    if (!communityName || communityName.trim() === '') {
      throw new Error('Community name cannot be empty')
    }
    try {
      return await createCommunity(communityName)
    } catch (error) {
      setErrorMessage(String(error))
      throw error
    }
  }

  const { mutate: handleAddCommunity, isLoading: isAddingCommunity } =
    useMutation(addCommunity, {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries('communities')
        handleCloseCommunityModal()
        setIsAddingCommunityComplete(true)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    })

  const handleOpenDeleteCommunityModal = (CommunityId: number): void => {
    setCommunityId(CommunityId)
    setDeleteCommunityModalVisible(true)
  }

  const handleCloseDeleteCommunityModal = (): void => {
    setDeleteCommunityModalVisible(false)
  }

  const removeCommunity = async (): Promise<void> => {
    if (!communityId) return
    try {
      await deleteCommunity(communityId, false)
    } catch (error) {
      setErrorMessage(String(error))
      throw error
    }
  }

  const { mutate: handleDeleteCommunity, isLoading: isDeletingCommunity } =
    useMutation(removeCommunity, {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries('communities')
        handleCloseDeleteCommunityModal()
        setIsDeletingCommunityComplete(true)
      },
      onError: (error: Error) => {
        try {
          const parsedError = JSON.parse(error.message)
          setErrorMessage(
            parsedError.details?.detail || 'Failed to delete team',
          )
        } catch {
          setErrorMessage(error.message)
        }
      },
    })

  const handleOpenEditCommunityModal = (CommunityId: number): void => {
    setCommunityId(CommunityId)
    setOpenEditCommunityModal(true)
  }

  const handleCloseEditCommunityModal = (): void => {
    setOpenEditCommunityModal(false)
  }

  const editCommunity = async (): Promise<void> => {
    if (!communityName || communityName.trim() === '') {
      throw new Error('Community name cannot be empty')
    }
    if (!communityId) return

    try {
      await updateCommunity(communityId, communityName)
    } catch (error) {
      setErrorMessage(String(error))
    }
  }

  const { mutate: handleEditCommunity, isLoading: isEditingCommunity } =
    useMutation(editCommunity, {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries('communities')
        handleCloseEditCommunityModal()
        setIsEditingCommunityComplete(true)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    })

  return (
    <>
      {isLoading ? (
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
                  value={''} // Controlled input
                  onChange={handleCommunityNameChange}
                  onBlur={handleCommunityNameBlur}
                  autoFocus
                />
                {errorMessage && (
                  <AlertBanner variant="error" message={errorMessage} />
                )}
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
                {errorMessage && (
                  <Text className="text-error">{errorMessage}</Text>
                )}
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

          {isEditingCommunityComplete && (
            <Toast
              variant="success"
              message="Community edited successfully"
              isCloseable
              onClose={() => setIsEditingCommunityComplete(false)}
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

          {!!hasErrorFetchingCommunities && (
            <AlertBanner
              variant="error"
              message="Failed to fetch communities"
            />
          )}
        </>
      )}
    </>
  )
}

export default CommunityPage
