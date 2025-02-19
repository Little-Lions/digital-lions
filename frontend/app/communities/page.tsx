'use client'

import React, { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from 'react-query'

import { TrashIcon, PencilIcon, UsersIcon } from '@heroicons/react/16/solid'

import { useCommunity } from '@/context/CommunityContext'
import { useCustomUser } from '@/context/UserContext'
import { useImplementingPartner } from '@/context/ImplementingPartnerContext'

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
import EmptyState from '@/components/EmptyState'

import { Community } from '@/types/community.interface'

const CommunityPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { communityName, setCommunityName } = useCommunity()
  const { selectedImplementingPartnerId } = useImplementingPartner()

  const { customUser } = useCustomUser()

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
      return await getCommunities(selectedImplementingPartnerId)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }

  const {
    data: communities = [],
    isLoading,
    error: hasErrorFetchingCommunities,
  } = useQuery<Community[], Error>(
    ['communities', selectedImplementingPartnerId],
    fetchCommunities,
    {
      enabled: !!selectedImplementingPartnerId,
      staleTime: 5 * 60 * 1000,
    },
  )

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
    const trimmedName = (communityName ?? '').trim()

    if (!trimmedName) {
      throw new Error('Community name cannot be empty or spaces only')
    }

    try {
      return await createCommunity(trimmedName)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
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
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
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
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
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
          {communities.length > 0 ? (
            <>
              {/* Show "Add Community" button if the user has permission */}
              {customUser?.permissions.includes('communities:write') && (
                <CustomButton
                  label="Add Community"
                  onClick={handleOpenCommunityModal}
                  variant="outline"
                  isFullWidth
                  className="mb-4"
                />
              )}

              {/* Render Community List */}
              {communities.map((community) => (
                <LinkCard
                  key={community.id}
                  title={community.name}
                  href={`/communities/${community.id}/teams`}
                  onClick={() => setCommunityName(community.name)}
                  className="mb-2"
                >
                  {/* Edit and Delete Buttons (Only for users with permission) */}
                  {customUser?.permissions.includes('communities:write') && (
                    <ButtonGroup>
                      <CustomButton
                        label="Edit"
                        variant="secondary"
                        icon={<PencilIcon />}
                        onClick={() =>
                          handleOpenEditCommunityModal(community.id)
                        }
                      />
                      <CustomButton
                        label="Delete"
                        variant="error"
                        icon={<TrashIcon />}
                        onClick={() =>
                          handleOpenDeleteCommunityModal(community.id)
                        }
                      />
                    </ButtonGroup>
                  )}
                </LinkCard>
              ))}
            </>
          ) : (
            <EmptyState
              title="No communities available"
              text="This implementing partner has no communities"
              pictogram={<UsersIcon />}
            />
          )}

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
                  value={''}
                  onChange={handleCommunityNameChange}
                  onBlur={handleCommunityNameBlur}
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
                  <AlertBanner
                    variant="error"
                    message={errorMessage}
                    isCloseable={false}
                  />
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
              isCloseable={true}
              onClose={() => setIsAddingCommunityComplete(false)}
            />
          )}
          {isEditingCommunityComplete && (
            <Toast
              variant="success"
              message="Community edited successfully"
              isCloseable={true}
              onClose={() => setIsEditingCommunityComplete(false)}
            />
          )}
          {isDeletingCommunityComplete && (
            <Toast
              variant="success"
              message="Community deleted successfully"
              isCloseable={true}
              onClose={() => setIsDeletingCommunityComplete(false)}
            />
          )}
          {!!hasErrorFetchingCommunities && (
            <AlertBanner variant="error" message={errorMessage ?? ''} />
          )}
        </>
      )}
    </>
  )
}

export default CommunityPage
