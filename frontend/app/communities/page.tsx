'use client'

import React, { useState, useRef, useReducer } from 'react'

import { UsersIcon } from '@heroicons/react/24/solid'

import { useCommunity } from '@/context/CommunityContext'
import { useCustomUser } from '@/context/UserContext'
import { useImplementingPartner } from '@/context/ImplementingPartnerContext'

import CommunityFormModal from '@/components/CommunityFormModal'

import CustomButton from '@/components/CustomButton'
import SkeletonLoader from '@/components/SkeletonLoader'
import Toast from '@/components/Toast'
import ConfirmModal from '@/components/ConfirmModal'
import AlertBanner from '@/components/AlertBanner'
import EmptyState from '@/components/EmptyState'
import CommunitiesList from '@/components/CommunityList'

import { useCommunityService } from '@/hooks/useCommunityService'

const CommunityPage: React.FC = () => {
  const { communityName, setCommunityName } = useCommunity()
  const { selectedImplementingPartnerId } = useImplementingPartner()

  const { customUser } = useCustomUser()

  const latestSelectedElement = useRef<HTMLButtonElement | null>(null)

  const [communityId, setCommunityId] = useState<number | null>(null)

  const {
    communitiesQuery,
    addCommunityMutation,
    editCommunityMutation,
    deleteCommunityMutation,
  } = useCommunityService(selectedImplementingPartnerId)

  const isAddingCommunity = addCommunityMutation.isPending
  const isEditingCommunity = editCommunityMutation.isPending
  const isDeletingCommunity = deleteCommunityMutation.isPending

  const {
    data: communities = [],
    isLoading,
    error: hasErrorFetchingCommunities,
  } = communitiesQuery

  const handleOpenCommunityModal = (): void => {
    dispatch({ type: 'OPEN_MODAL', modal: 'add' })
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
  }

  const handleCloseCommunityModal = (): void => {
    dispatch({ type: 'CLOSE_MODAL' })
    setCommunityName('')
    setTimeout(() => {
      latestSelectedElement?.current?.focus()
    }, 0)
  }

  const handleAddCommunity = (): void => {
    const trimmedName = (communityName ?? '').trim()
    if (!trimmedName) {
      dispatch({
        type: 'SET_ERROR',
        message: 'Community name cannot be empty or spaces only',
      })
      return
    }

    addCommunityMutation.mutate(trimmedName, {
      onSuccess: () => {
        handleCloseCommunityModal()
        dispatch({ type: 'SET_COMPLETE' })
      },
      onError: (error: Error) => {
        dispatch({ type: 'SET_ERROR', message: error.message })
      },
    })
  }

  const handleOpenDeleteCommunityModal = (communityId: number): void => {
    dispatch({ type: 'OPEN_MODAL', modal: 'delete' })
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
    setCommunityId(communityId)
  }

  const handleCloseDeleteCommunityModal = (): void => {
    dispatch({ type: 'CLOSE_MODAL' })
    setTimeout(() => {
      latestSelectedElement?.current?.focus()
    }, 0)
  }

  const handleDeleteCommunity = (): void => {
    if (!communityId) return

    deleteCommunityMutation.mutate(communityId, {
      onSuccess: () => {
        handleCloseDeleteCommunityModal()
        dispatch({ type: 'SET_COMPLETE' })
      },
      onError: (error: Error) => {
        try {
          const parsedError = JSON.parse(error.message)
          dispatch({
            type: 'SET_ERROR',
            message: parsedError.details?.detail || 'Failed to delete team',
          })
        } catch {
          dispatch({ type: 'SET_ERROR', message: error.message })
        }
      },
    })
  }

  const handleOpenEditCommunityModal = (communityId: number): void => {
    dispatch({ type: 'OPEN_MODAL', modal: 'edit' })
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
    setCommunityId(communityId)
  }

  const handleCloseEditCommunityModal = (): void => {
    dispatch({ type: 'CLOSE_MODAL' })
    setCommunityName('')
    setTimeout(() => {
      latestSelectedElement?.current?.focus()
    }, 0)
  }

  const handleEditCommunity = (): void => {
    const trimmedName = (communityName ?? '').trim()
    if (!trimmedName || !communityId) {
      dispatch({
        type: 'SET_ERROR',
        message: 'Community name cannot be empty',
      })
      return
    }

    editCommunityMutation.mutate(
      { id: communityId, name: trimmedName },
      {
        onSuccess: () => {
          handleCloseEditCommunityModal()
          dispatch({ type: 'SET_COMPLETE' })
        },
        onError: (error: Error) => {
          console.log('error', error.message)
          dispatch({ type: 'SET_ERROR', message: error.message })
        },
      },
    )
  }

  type ModalType = 'add' | 'edit' | 'delete' | null

  interface State {
    modalType: ModalType
    isModalOpen: boolean
    showToast: boolean
    errorMessage: string | null
  }

  type Action =
    | { type: 'OPEN_MODAL'; modal: ModalType }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_COMPLETE' }
    | { type: 'CLEAR_COMPLETE' }
    | { type: 'SET_ERROR'; message: string | null }

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case 'OPEN_MODAL':
        return {
          ...state,
          modalType: action.modal,
          isModalOpen: true,
          showToast: false,
          errorMessage: null,
        }
      case 'CLOSE_MODAL':
        return {
          ...state,
          isModalOpen: false,
          errorMessage: null,
        }
      case 'SET_COMPLETE':
        return {
          ...state,
          isModalOpen: false,
          showToast: true,
        }
      case 'CLEAR_COMPLETE':
        return {
          ...state,
          showToast: false,
          modalType: null,
        }

      case 'SET_ERROR':
        return { ...state, errorMessage: action.message }

      default:
        return state
    }
  }
  const [modalState, dispatch] = useReducer(reducer, {
    modalType: null,
    isModalOpen: false,
    showToast: false,
    errorMessage: null,
  })

  const toastMessages: Record<'add' | 'edit' | 'delete', string> = {
    add: 'Community added successfully',
    edit: 'Community edited successfully',
    delete: 'Community deleted successfully',
  }

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
              <CommunitiesList
                communities={communities}
                customUser={customUser || undefined}
                setCommunityName={setCommunityName}
                handleOpenEditCommunityModal={handleOpenEditCommunityModal}
                handleOpenDeleteCommunityModal={handleOpenDeleteCommunityModal}
              />
            </>
          ) : (
            <EmptyState
              title="No communities available"
              text="This implementing partner has no communities"
              pictogram={<UsersIcon />}
              actionButton={
                customUser?.permissions.includes('communities:write') ? (
                  <CustomButton
                    label="Add Community"
                    onClick={handleOpenCommunityModal}
                    variant="primary"
                    isFullWidth
                    className="mb-4"
                  />
                ) : null
              }
            />
          )}
          {modalState.isModalOpen &&
            (modalState.modalType === 'add' ||
              modalState.modalType === 'edit') && (
              <CommunityFormModal
                modalType={modalState.modalType}
                errorMessage={modalState.errorMessage}
                communityName={communityName || ''}
                isAdding={isAddingCommunity}
                isEditing={isEditingCommunity}
                onAccept={
                  modalState.modalType === 'edit'
                    ? handleEditCommunity
                    : handleAddCommunity
                }
                onClose={
                  modalState.modalType === 'edit'
                    ? handleCloseEditCommunityModal
                    : handleCloseCommunityModal
                }
                onCommunityNameChange={setCommunityName}
                setErrorMessage={(msg) =>
                  dispatch({ type: 'SET_ERROR', message: msg })
                }
              />
            )}
          {modalState.isModalOpen && modalState.modalType === 'delete' && (
            <ConfirmModal
              title="Delete community"
              text="Are you sure you want to delete this community?"
              onAccept={handleDeleteCommunity}
              onClose={handleCloseDeleteCommunityModal}
              acceptText="Delete"
              closeText="Cancel"
              autoFocusAccept
              isBusy={isDeletingCommunity}
              errorMessage={modalState.errorMessage || ''}
            />
          )}
          {modalState.showToast && modalState.modalType && (
            <Toast
              variant="success"
              message={
                toastMessages[modalState.modalType as 'add' | 'edit' | 'delete']
              }
              isCloseable
              onClose={() => dispatch({ type: 'CLEAR_COMPLETE' })}
            />
          )}
          {!!hasErrorFetchingCommunities && (
            <AlertBanner
              variant="error"
              message={hasErrorFetchingCommunities.message}
              isCloseable={false}
              className="mt-4"
            />
          )}
        </>
      )}
    </>
  )
}

export default CommunityPage
