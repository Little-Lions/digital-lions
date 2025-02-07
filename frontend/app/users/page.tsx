'use client'

import React, { useState, useEffect } from 'react'

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunctionContext,
} from 'react-query'

import TextInput from '@/components/TextInput'
import CustomButton from '@/components/CustomButton'
import Modal from '@/components/Modal'
import ButtonGroup from '@/components/ButtonGroup'
import SkeletonLoader from '@/components/SkeletonLoader'
import Accordion from '@/components/Accordion'
import SelectInput from '@/components/SelectInput'
import Toast from '@/components/Toast'
import Text from '@/components/Text'

// import Loader from '@/components/Loader'

import { TrashIcon, PencilIcon, UserPlusIcon } from '@heroicons/react/16/solid'

import getRoles from '@/api/services/roles/getRoles'
import getLevels from '@/api/services/roles/getLevels'
import getResources from '@/api/services/roles/getResources'
import getUser from '@/api/services/users/getUser'
import getUsers from '@/api/services/users/getUsers'
import createUser from '@/api/services/users/createUser'
// import createUserInvite from '@/api/services/users/createUserInvite'
import deleteUser from '@/api/services/users/deleteUser'
import assignRoleToUser from '@/api/services/users/assignRoleToUser'

// import getCommunities from "@/api/services/communities/getCommunities";

import { User } from '@/types/user.interface'
import { Role } from '@/types/role.type'
import { Level } from '@/types/level.type'
import { Resource } from '@/types/resource.interface'
import AlertBanner from '@/components/AlertBanner'
import ConfirmModal from '@/components/ConfirmModal'

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  //   const [user, setUser] = useState<User | null>(null);
  // const [isLoading, setIsLoading] = useState(false)

  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)

  const [isAssigningUser, setIsAssigningUser] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const [addUserModalVisible, setAddUserModalVisible] = useState(false)
  // const [editUserModalVisible, setEditUserModalVisible] = useState(false)
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false)
  const [assignUserModalVisible, setAssignUserModalVisible] = useState(false)

  const [isRoleAssignmentComplete, setIsRoleAssignmentComplete] =
    useState(false)
  const [isAddingUserComplete, setIsAddingUserComplete] = useState(false)
  const [isDeletingUserComplete, setIsDeletingUserComplete] = useState(false)
  // const [isEditingUserComplete, setIsEditingUserComplete] = useState(false);

  const [addUserError, setAddUserError] = useState<string | null>(null)

  const [nickName, setNickName] = useState<string>('')
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [availableRoles, setAvailableRoles] = useState<Role[] | null>(null)
  const [availableLevels, setAvailableLevels] = useState<Level[] | null>(null)
  const [availableResources, setAvailableResources] = useState<
    Resource[] | null
  >(null)

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)
  const [selectedResourceName, setSelectedResourceName] = useState<
    string | null
  >(null)
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(
    null,
  )

  //   const [communities, setCommunities] = useState<Community[]>([]);

  const handleRoleChange = (role: Role): void => {
    setSelectedRole(role)
    fetchLevels(role)
  }

  const handleLevelChange = (level: Level): void => {
    setSelectedLevel(level)
    fetchResources(level)
  }

  const handleResourceChange = (resource: Resource): void => {
    setSelectedResourceName(resource.resource_name)
    setSelectedResourceId(resource.resource_id)
  }

  const fetchUsers = async (): Promise<User[]> => {
    try {
      return await getUsers()
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
    data: users = [],
    isLoading,
    error: hasErrorFetchingUsers,
  } = useQuery<User[], Error>('users', fetchUsers, {
    staleTime: 5 * 60 * 1000,
  })

  const fetchUser = async (userId: string): Promise<User> => {
    try {
      return await getUser(userId)
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
    data: selectedUser,
    isLoading: isLoadingUser,
    error: hasErrorFetchingUser,
  } = useQuery<User, Error>(
    ['user', selectedUserId],
    () => fetchUser(selectedUserId!),
    {
      enabled: Boolean(selectedUserId),
      staleTime: 5 * 60 * 1000,
    },
  )

  //   const handleSaveUser = async () => {
  //     if (!selectedUserId) return; // Ensure there's a user selected
  //     setIsLoadingUser(true);
  //     try {
  //       // Update user details in the backend
  //       await createUser(selectedUserId, {
  //         nickname: nickName,
  //         email: emailAddress,
  //       });

  //       // Refresh the user list
  //       fetchUsers();

  //       // Close the modal after saving
  //       handleCloseEditUserModal();
  //     } catch (error) {
  //       console.error("Failed to save user:", error);
  //     } finally {
  //       setIsLoadingUser(false);
  //     }
  //   };

  const handleNicknameChange = (value: string): void => {
    setNickName(value)
  }

  const handleEmailAddressChange = (value: string): void => {
    setEmailAddress(value)
  }

  const handleOpenAddUserModal = (): void => {
    setAddUserModalVisible(true)
  }

  const handleCloseAddUserModal = (): void => {
    setAddUserModalVisible(false)
    setEmailAddress('')
    setAddUserError(null)
  }

  // const handleOpenEditUserModal = (userId: string): void => {
  //   setSelectedUserId(userId)
  //   setEditUserModalVisible(true)
  // }

  // const handleCloseEditUserModal = (): void => {
  //   setEditUserModalVisible(false)
  //   setSelectedUserId(null)
  //   setNickName('')
  //   setEmailAddress('')
  // }

  const handleOpenDeleteUserModal = (userId: string): void => {
    setSelectedUserId(userId)
    setDeleteUserModalVisible(true)
  }

  const handleCloseDeleteUserModal = (): void => {
    setDeleteUserModalVisible(false)
    setSelectedUserId(null)
    setErrorMessage('')
  }

  const handleOpenAssignUserModal = async (userId: string): Promise<void> => {
    setSelectedUserId(userId)
    setAssignUserModalVisible(true)
    await fetchRoles()
  }

  const handleCloseAssignUserModal = (): void => {
    setAssignUserModalVisible(false)
    setSelectedUserId(null)
    setSelectedRole(null)
    setSelectedLevel(null)
    setSelectedResourceName(null)
    setSelectedResourceId(null)
  }

  const handleAssignRoleToUser = async (): Promise<void> => {
    if (!selectedUserId) return
    setIsAssigningUser(true)

    try {
      await assignRoleToUser(
        selectedUserId,
        selectedRole as Role,
        selectedLevel as Level,
        selectedResourceId as number,
      )
      setIsRoleAssignmentComplete(true)
      await fetchUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsAssigningUser(false)
      handleCloseAssignUserModal()
    }
  }

  const AddUser = async (email: string): Promise<void> => {
    try {
      if (email.trim() === '') {
        throw new Error('Email address is required')
      }

      await createUser(email)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }

  const { mutate: handleAddUser, isLoading: isAddingUser } = useMutation(
    (email: string) => AddUser(email),
    {
      onSuccess: async () => {
        handleCloseAddUserModal()
        setIsAddingUserComplete(true)
        await queryClient.invalidateQueries('users')
      },
      onError: (error: Error) => {
        setAddUserError(error.message)
      },
    },
  )

  // const handleAddUserInvite = async () => {
  //   if (!selectedUserId) return;
  //   setIsLoadingUser(true);
  //   try {
  //     await createUserInvite(selectedUserId);
  //     await fetchUsers();
  //   } catch (error) {
  //     console.error("Failed to update user:", error);
  //   } finally {
  //     setIsLoadingUser(false);
  //     handleCloseEditUserModal();
  //   }
  // };

  const removeUser = async (userId: string): Promise<void> => {
    try {
      if (!userId.trim()) {
        throw new Error('User ID is required')
      }
      await deleteUser(userId)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }

  const { mutate: handleDeleteUser, isLoading: isDeletingUser } = useMutation(
    () => removeUser(selectedUserId!),
    {
      onSuccess: async () => {
        handleCloseDeleteUserModal()
        setIsDeletingUserComplete(true)
        await queryClient.invalidateQueries('users')
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    },
  )

  const fetchRoles = async (): Promise<void> => {
    try {
      setIsFetching(true)
      const roles = await getRoles()
      setAvailableRoles(roles)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const fetchLevels = async (role: Role): Promise<void> => {
    try {
      setIsFetching(true)
      const levels = await getLevels(role)
      setAvailableLevels(levels)
    } catch (error) {
      console.error('Failed to fetch levels:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const fetchResources = async (level: Level): Promise<void> => {
    try {
      setIsFetching(true)
      const resources = await getResources(selectedRole as Role, level)
      setAvailableResources(resources)
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
          {/* {isLoadingUserData && <Loader loadingText="Loading user data" />} */}
          <CustomButton
            label="Invite new user"
            onClick={handleOpenAddUserModal}
            variant="outline"
            isFullWidth
            className="hover:bg-card-dark hover:text-white mb-4"
          />
          {users.map((user) => (
            <Accordion
              key={user.user_id}
              title={user.nickname}
              className="mb-2"
            >
              <div>
                <Text>{`Nickname: ${user.nickname}`}</Text>
                <Text>{`Email: ${user.email}`}</Text>
              </div>
              <div className="border-t mt-4 border-gray-200 " />

              <ButtonGroup>
                <CustomButton
                  className="mt-4"
                  label="Assign"
                  variant="outline"
                  icon={<UserPlusIcon />}
                  onClick={() =>
                    user.user_id && handleOpenAssignUserModal(user.user_id)
                  }
                />
                {/* <CustomButton
                  className="mt-4"
                  label="Edit"
                  variant="secondary"
                  isBusy={selectedUserId === user.user_id && isLoadingUser}
                  icon={<PencilIcon />}
                  onClick={() => handleOpenEditUserModal(user.user_id)}
                /> */}
                <CustomButton
                  className="mt-4"
                  label="Delete"
                  variant="error"
                  icon={<TrashIcon />}
                  onClick={() =>
                    user.user_id && handleOpenDeleteUserModal(user.user_id)
                  }
                />
              </ButtonGroup>
            </Accordion>
          ))}

          {addUserModalVisible && (
            <Modal
              onClose={handleCloseAddUserModal}
              title="Invite new user"
              acceptText="Invite"
              onAccept={() => handleAddUser(emailAddress)}
              isBusy={isAddingUser}
              isDisabledButton={!emailAddress.trim()}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddUser(emailAddress)
                }}
              >
                <TextInput
                  label="Email address"
                  value={emailAddress}
                  onChange={handleEmailAddressChange}
                  required
                  errorMessage="Email address is required"
                  autoFocus
                />
                {addUserError && (
                  <AlertBanner variant="error" message={addUserError} />
                )}
              </form>
            </Modal>
          )}

          {/* {editUserModalVisible && selectedUser && (
            <Modal
              onClose={handleCloseEditUserModal}
              title="Edit user"
              acceptText="Save"
              onAccept={() => handleAddUser(selectedUser?.email || '')}
            >
              <TextInput
                label="Nickname"
                value={selectedUser?.nickname || ''}
                onChange={(e) => handleNicknameChange(e)}
                required
                errorMessage="Nickname is required"
                autoFocus
              />
              <TextInput
                label="Email address"
                value={selectedUser?.email || ''}
                onChange={(e) => handleEmailAddressChange(e)}
                required
                errorMessage="Email address is required"
              />
              {hasErrorFetchingUser && (
                <AlertBanner variant="error" message={errorMessage ?? ''} />
              )}
            </Modal>
          )} */}

          {assignUserModalVisible && (
            <Modal
              onClose={handleCloseAssignUserModal}
              title="Assign role to user"
              acceptText="Assign"
              onAccept={handleAssignRoleToUser}
              isBusy={isAssigningUser || isFetching}
            >
              <SelectInput
                className="mb-2"
                label="Role"
                value={selectedRole ?? ''}
                onChange={(value: string | number) =>
                  handleRoleChange(value as Role)
                }
                autoFocus
              >
                <option value="">Select role</option>
                {availableRoles &&
                  availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
              </SelectInput>

              <SelectInput
                className="mb-2"
                label="Level"
                value={selectedLevel ?? ''}
                disabled={!selectedRole}
                onChange={(value: string | number) =>
                  handleLevelChange(value as Level)
                }
              >
                <option value="">Select level</option>
                {availableLevels &&
                  availableLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
              </SelectInput>

              <SelectInput
                className="mb-2"
                label="Resource"
                value={selectedResourceName ?? ''}
                disabled={!selectedRole || !selectedLevel}
                onChange={(value: string | number) => {
                  const selected = availableResources?.find(
                    (resource) => resource.resource_name === value,
                  )
                  if (selected) {
                    handleResourceChange(selected as Resource)
                  }
                }}
              >
                <option value="">Select resource</option>
                {availableResources &&
                  availableResources.map((resource) => (
                    <option
                      key={resource.resource_id}
                      value={resource.resource_name}
                    >
                      {resource.resource_name}
                    </option>
                  ))}
              </SelectInput>
              {errorMessage && (
                <AlertBanner variant="error" message={errorMessage ?? ''} />
              )}
            </Modal>
          )}

          {deleteUserModalVisible && (
            <ConfirmModal
              title="Delete child"
              text="Are you sure you want to delete this user?"
              onAccept={handleDeleteUser}
              onClose={handleCloseDeleteUserModal}
              acceptText="Delete"
              closeText="Cancel"
              isBusy={isDeletingUser}
              errorMessage={errorMessage}
            />
          )}
          {isAddingUserComplete && (
            <Toast
              variant="success"
              message="User added successfully"
              isCloseable={true}
              onClose={() => setIsAddingUserComplete(false)}
            />
          )}

          {isDeletingUserComplete && (
            <Toast
              variant="success"
              message="User deleted successfully"
              isCloseable={true}
              onClose={() => setIsDeletingUserComplete(false)}
            />
          )}

          {/* {isEditingUserComplete && (
            <Toast
              variant="success"
              message="User edited successfully"
              isCloseable={true}
              onClose={() => setIsEditingUserComplete(false)}
            />
          )} */}

          {isRoleAssignmentComplete && (
            <Toast
              variant="success"
              message="Role assigned successfully"
              isCloseable={true}
              onClose={() => setIsRoleAssignmentComplete(false)}
            />
          )}

          {!!hasErrorFetchingUsers && (
            <AlertBanner variant="error" message={errorMessage ?? ''} />
          )}
        </>
      )}
    </>
  )
}

export default UsersPage
