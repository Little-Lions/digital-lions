'use client'

import React, { useState, useRef } from 'react'

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunctionContext,
} from 'react-query'

import Accordion from '@/components/Accordion'
import getTeams from '@/api/services/teams/getTeams'
import getTeamById from '@/api/services/teams/getTeamById'

import createChild from '@/api/services/children/createChild'
import updateChild from '@/api/services/children/updateChild'
import deleteChild from '@/api/services/children/deleteChild'

import Loader from '@/components/Loader'
import SelectInput from '@/components/SelectInput'
import CustomButton from '@/components/CustomButton'
import Modal from '@/components/Modal'
import TextInput from '@/components/TextInput'
import ConfirmModal from '@/components/ConfirmModal'
import SkeletonLoader from '@/components/SkeletonLoader'
import ButtonGroup from '@/components/ButtonGroup'
import Toast from '@/components/Toast'
import AlertBanner from '@/components/AlertBanner'
import Text from '@/components/Text'

import EmptyState from '@/components/EmptyState'

import { UserIcon } from '@heroicons/react/24/solid'
import { TrashIcon, PencilIcon } from '@heroicons/react/16/solid'

import { TeamWithChildren } from '@/types/teamWithChildren.interface'

import { useParams, useRouter } from 'next/navigation'

interface Team {
  name: string
  id: number
}

const TeamsDetailPage: React.FC = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useParams()

  const accordionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const latestSelectedElement = useRef<HTMLButtonElement | null>(null)

  const communityId = params?.communityId as string
  const teamId = params?.teamId as string

  const [modalVisible, setModalVisible] = useState(false)

  const [editChildId, setEditChildId] = useState<number | null>(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editAge, setEditAge] = useState<number | null>(null)
  const [editGender, setEditGender] = useState<string | null>(null)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const [deleteChildModalVisible, setDeleteChildModalVisible] = useState(false)

  const [isAddingChildComplete, setIsAddingChildComplete] = useState(false)
  const [isEditingChildComplete, setIsEditingChildComplete] = useState(false)
  const [isDeletingChildComplete, setIsDeletingChildComplete] = useState(false)

  const [editMode, setEditMode] = useState<'add' | 'edit'>('add')

  const [openChildIndex, setOpenChildIndex] = useState<number | null>(null)

  // eslint-disable  @typescript-eslint/no-explicit-any
  const fetchTeamById = async ({
    queryKey,
  }: QueryFunctionContext<string[], any>): Promise<TeamWithChildren> => {
    try {
      const [, teamId] = queryKey // Extract teamId from the query key
      const numericTeamId = Number(teamId)
      if (isNaN(numericTeamId)) {
        throw new Error('Invalid team ID')
      }
      return await getTeamById(numericTeamId)
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
    data: selectedTeam,
    isLoading: isLoadingSelectedTeam,
    error: hasErrorFetchingTeams,
  } = useQuery(['team', teamId], fetchTeamById, {
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch all teams on component mount
  const fetchTeams = async (): Promise<Team[]> => {
    try {
      const response = await getTeams('active')
      return response
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      throw error
    }
  }

  const { data: teamsByCommunity = [], isLoading: isLoadingTeamsByCommunity } =
    useQuery('teamsByCommunity', fetchTeams, {
      staleTime: 5 * 60 * 1000,
    })

  // Mutation to add a child
  const addChild = async () => {
    if (!selectedTeam) throw new Error('No team selected')
    try {
      return await createChild({
        teamId: selectedTeam.id,
        age: editAge || null,
        gender: editGender,
        firstName: editFirstName,
        lastName: editLastName,
      })
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }

  const { mutate: handleAddChild, isLoading: isAddingChild } = useMutation(
    addChild,
    {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries(['team', teamId]) // Refetch the selected team
        closeModal()
        setIsAddingChildComplete(true)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    },
  )

  // Mutation to edit a child
  const editChild = async () => {
    if (!editChildId) throw new Error('Invalid child ID')
    try {
      return await updateChild({
        childId: editChildId,
        isActive: true,
        age: editAge,
        gender: editGender,
        firstName: editFirstName,
        lastName: editLastName,
      })
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }

  const { mutate: handleEditChild, isLoading: isEditingChild } = useMutation(
    editChild,
    {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries(['team', teamId])
        closeModal()
        setIsEditingChildComplete(true)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    },
  )

  // Mutation to delete a child
  const removeChild = async () => {
    if (!editChildId) throw new Error('Invalid child ID')
    try {
      await deleteChild(editChildId, false)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }

  const { mutate: handleDeleteChild, isLoading: isDeletingChild } = useMutation(
    removeChild,
    {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries(['team', teamId])
        setDeleteChildModalVisible(false)
        setIsDeletingChildComplete(true)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    },
  )

  const handleTeamChange = (value: string | number): void => {
    const selectedId = typeof value === 'string' ? parseInt(value, 10) : value
    const url = `/communities/${communityId}/teams/${selectedId}`
    router.replace(url)
  }

  const closeModal = (): void => {
    setModalVisible(false)
    setEditChildId(null)
    setEditFirstName('')
    setEditLastName('')
    setEditAge(null)
    setEditGender(null)

    setTimeout(() => {
      latestSelectedElement?.current?.focus()
    }, 0)
  }

  const openEditChildModal = (child: {
    id: number
    first_name: string
    last_name: string
    age?: number
    gender?: string
  }): void => {
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
    setEditChildId(child.id)
    setEditFirstName(child.first_name)
    setEditLastName(child.last_name)
    setEditAge(child.age || null)
    setEditGender(child.gender || '')
    setEditMode('edit')
    setModalVisible(true)
  }

  const openAddChildModal = (): void => {
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
    setEditChildId(null)
    setEditFirstName('')
    setEditLastName('')
    setEditAge(null)
    setEditGender('')
    setEditMode('add')
    setModalVisible(true)
  }

  const openDeleteChildModal = (childId: number): void => {
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
    setEditChildId(childId)
    setDeleteChildModalVisible(true)
  }

  const handleCloseDeleteChildModal = (): void => {
    setDeleteChildModalVisible(false)
    setErrorMessage('')
    setTimeout(() => {
      latestSelectedElement?.current?.focus()
    }, 0)
  }

  return (
    <>
      {isLoadingTeamsByCommunity ? (
        <>
          <SkeletonLoader type="input" />
          <SkeletonLoader width="142px" type="button" />
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          {isLoadingSelectedTeam && <Loader loadingText="Loading team data" />}
          <SelectInput
            className="mb-4"
            label="Select team"
            value={selectedTeam?.id || ''}
            onChange={handleTeamChange}
          >
            <option value="">Select a team</option>
            {teamsByCommunity.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </SelectInput>

          {selectedTeam?.children.length ? (
            <CustomButton
              label="Add child"
              onClick={openAddChildModal}
              variant="outline"
              isFullWidth
              className="mb-4"
            />
          ) : (
            <EmptyState
              title="This team has no children"
              text="Add a child to the team to get started"
              pictogram={<UserIcon />}
              actionButton={
                <CustomButton
                  label="Add child"
                  onClick={openAddChildModal}
                  variant="primary"
                />
              }
            />
          )}

          {selectedTeam && (
            <>
              {selectedTeam.children.map((child, index) => (
                <Accordion
                  key={index}
                  index={index}
                  id={`accordion-item-${index}`}
                  totalItems={selectedTeam.children.length}
                  buttonRefs={accordionRefs}
                  title={`${child.first_name} ${child.last_name}`}
                  className="mb-2"
                  isOpen={openChildIndex === index} // ✅ Controlled by parent
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenChildIndex(openChildIndex === index ? null : index) // ✅ Toggle open/close state
                  }}
                >
                  <div>
                    <Text>{`First Name: ${child.first_name}`}</Text>
                    <Text>{`Last Name: ${child.last_name}`}</Text>
                    <Text>{`Age: ${child.age}`}</Text>
                    <Text>{`Gender: ${child.gender}`}</Text>
                  </div>
                  <div className="border-t mt-4 border-gray-200 dark:border-gray-600" />
                  <ButtonGroup>
                    <CustomButton
                      className="mt-4"
                      label="Edit"
                      variant="secondary"
                      icon={<PencilIcon />}
                      onClick={() => openEditChildModal(child)}
                    />
                    <CustomButton
                      className="mt-4"
                      label="Delete"
                      variant="error"
                      icon={<TrashIcon />}
                      onClick={() => openDeleteChildModal(child.id)}
                    />
                  </ButtonGroup>
                </Accordion>
              ))}
            </>
          )}

          {deleteChildModalVisible && (
            <ConfirmModal
              title="Delete child"
              text="Are you sure you want to delete this child?"
              onAccept={handleDeleteChild}
              onClose={handleCloseDeleteChildModal}
              acceptText="Delete"
              closeText="Cancel"
              autoFocusAccept
              isBusy={isDeletingChild}
              errorMessage={errorMessage}
            />
          )}

          {modalVisible && (
            <Modal
              onClose={closeModal}
              title={editMode === 'edit' ? 'Edit child' : 'Add child'}
              acceptText={editMode === 'edit' ? 'Edit' : 'Add'}
              onAccept={editMode === 'edit' ? handleEditChild : handleAddChild}
              isBusy={isAddingChild || isEditingChild}
              isDisabledButton={!editFirstName || !editLastName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  editMode === 'edit' ? handleEditChild() : handleAddChild()
                }}
              >
                <TextInput
                  className="mb-2"
                  label="First Name"
                  value={editFirstName}
                  onChange={(value) => setEditFirstName(value)}
                  required
                  autoFocus
                  errorMessage="Please enter your first name"
                />
                <TextInput
                  className="mb-2"
                  label="Last Name"
                  value={editLastName}
                  onChange={(value) => setEditLastName(value)}
                  required
                  errorMessage="Please enter your last name"
                />
                <TextInput
                  className="mb-2"
                  label="Age"
                  value={editAge?.toString() || ''}
                  onChange={(value) => setEditAge(parseInt(value, 10))}
                />
                <SelectInput
                  className="mb-2"
                  label="Gender"
                  value={editGender ?? ''}
                  onChange={(value: string | number) =>
                    setEditGender(String(value))
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </SelectInput>
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

          {isAddingChildComplete && (
            <Toast
              variant="success"
              message="Child added successfully"
              isCloseable={true}
              onClose={() => setIsAddingChildComplete(false)}
            />
          )}

          {isEditingChildComplete && (
            <Toast
              variant="success"
              message="Child updated successfully"
              isCloseable={true}
              onClose={() => setIsEditingChildComplete(false)}
            />
          )}

          {isDeletingChildComplete && (
            <Toast
              variant="success"
              message="Child deleted successfully"
              isCloseable={true}
              onClose={() => setIsDeletingChildComplete(false)}
            />
          )}

          {!!hasErrorFetchingTeams && (
            <AlertBanner variant="error" message={errorMessage ?? ''} />
          )}
        </>
      )}
    </>
  )
}

export default TeamsDetailPage
