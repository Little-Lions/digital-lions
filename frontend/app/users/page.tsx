"use client";

import React, { useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import CustomButton from "@/components/CustomButton";
import Modal from "@/components/Modal";
import ButtonGroup from "@/components/ButtonGroup";
import SkeletonLoader from "@/components/SkeletonLoader";
import Accordion from "@/components/Accordion";
import SelectInput from "@/components/SelectInput";
import Toast from "@/components/Toast";
import Loader from "@/components/Loader";

import { TrashIcon, PencilIcon, UserPlusIcon } from "@heroicons/react/16/solid";

import getRoles from "@/api/services/roles/getRoles";
import getLevels from "@/api/services/roles/getLevels";
import getResources from "@/api/services/roles/getResources";
import getUser from "@/api/services/users/getUser";
import getUsers from "@/api/services/users/getUsers";
import createUser from "@/api/services/users/createUser";
import createUserInvite from "@/api/services/users/createUserInvite";
import deleteUser from "@/api/services/users/deleteUser";
import assignRoleToUser from "@/api/services/users/assignRoleToUser";

// import getCommunities from "@/api/services/communities/getCommunities";

import { User } from "@/types/user.interface";
import { Role } from "@/types/role.type";
import { Level } from "@/types/level.type";
import { Resource } from "@/types/resource.interface";
import AlertBanner from "@/components/AlertBanner";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  //   const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  //   const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);

  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false);
  const [assignUserModalVisible, setAssignUserModalVisible] = useState(false);

  const [isRoleAssignmentComplete, setIsRoleAssignmentComplete] =
    useState(false);
  const [isAddingUserComplete, setIsAddingUserComplete] = useState(false);
  const [isDeletingUserComplete, setIsDeletingUserComplete] = useState(false);
  // const [isEditingUserComplete, setIsEditingUserComplete] = useState(false);

  const [nickName, setNickName] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[] | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[] | null>(null);
  const [availableResources, setAvailableResources] = useState<
    Resource[] | null
  >(null);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedResourceName, setSelectedResourceName] = useState<
    string | null
  >(null);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(
    null
  );

  //   const [communities, setCommunities] = useState<Community[]>([]);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    fetchLevels(role);
  };

  const handleLevelChange = (level: Level) => {
    setSelectedLevel(level);
    fetchResources(level);
  };

  const handleResourceChange = (resource: Resource) => {
    setSelectedResourceName(resource.resource_name);
    setSelectedResourceId(resource.resource_id);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async (userId: string) => {
    setIsLoadingUser(true);
    try {
      const user = await getUser(userId); // Fetch user details from the API
      setNickName(user.nickname); // Populate nickname field
      setEmailAddress(user.email); // Populate email address field
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

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

  const handleNicknameChange = (value: string) => {
    setNickName(value);
  };

  const handleEmailAddressChange = (value: string) => {
    setEmailAddress(value);
  };

  //   const fetchCommunities = async () => {
  //     setIsLoadingCommunity(true);
  //     try {
  //       const communities = await getCommunities();
  //       setCommunities(communities);
  //     } catch (error) {
  //       console.error("Failed to fetch communities:", error);
  //     } finally {
  //       setIsLoadingCommunity(false);
  //     }
  //   }

  const handleOpenAddUserModal = async () => {
    // await fetchCommunities()
    setAddUserModalVisible(true);
  };

  const handleCloseAddUserModal = () => {
    setAddUserModalVisible(false);
  };

  const handleOpenEditUserModal = (userId: string) => {
    setSelectedUserId(userId);
    fetchUser(userId);
    setEditUserModalVisible(true);
  };

  const handleCloseEditUserModal = () => {
    setEditUserModalVisible(false);
    setSelectedUserId(null);
    setNickName("");
    setEmailAddress("");
  };

  const handleOpenDeleteUserModal = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteUserModalVisible(true);
  };

  const handleCloseDeleteUserModal = () => {
    setDeleteUserModalVisible(false);
    setSelectedUserId(null);
  };

  const handleOpenAssignUserModal = async (userId: string) => {
    setSelectedUserId(userId);
    setAssignUserModalVisible(true);
    fetchRoles();
  };

  const handleCloseAssignUserModal = () => {
    setAssignUserModalVisible(false);
    setSelectedUserId(null);
    setSelectedRole(null);
    setSelectedLevel(null);
    setSelectedResourceName(null);
    setSelectedResourceId(null);
  };

  const handleAssignRoleToUser = async () => {
    if (!selectedUserId) return;
    setIsAssigningUser(true);

    try {
      await assignRoleToUser(
        selectedUserId,
        selectedRole as Role,
        selectedLevel as Level,
        selectedResourceId as number
      );
      setIsRoleAssignmentComplete(true);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsAssigningUser(false);
      handleCloseAssignUserModal();
    }
  };

  const handleAddUser = async () => {
    if (emailAddress.trim() === "") return;

    setIsAddingUser(true);
    try {
      await createUser(emailAddress);
      await fetchUsers();
      setIsAddingUserComplete(true);
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setIsAddingUser(false);
      handleCloseAddUserModal();
    }
  };

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

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    setIsDeletingUser(true);
    try {
      await deleteUser(selectedUserId);

      setIsDeletingUserComplete(true);
      setUsers(users.filter((user) => user.user_id !== selectedUserId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeletingUser(false);
      handleCloseDeleteUserModal();
    }
  };

  const fetchRoles = async () => {
    try {
      setIsFetching(true);
      const roles = await getRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchLevels = async (role: Role) => {
    try {
      setIsFetching(true);
      const levels = await getLevels(role);
      setAvailableLevels(levels);
    } catch (error) {
      console.error("Failed to fetch levels:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchResources = async (level: Level) => {
    try {
      setIsFetching(true);
      const resources = await getResources(selectedRole as Role, level);
      setAvailableResources(resources);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
                <p>{`Nickname: ${user.nickname}`}</p>
                <p>{`Email: ${user.email}`}</p>
              </div>
              <div className="border-t mt-4 border-gray-200 dark:border-gray-600" />

              <ButtonGroup>
                <CustomButton
                  className="mt-4 float-left"
                  label="Assign role"
                  variant="outline"
                  icon={<UserPlusIcon />}
                  onClick={() => handleOpenAssignUserModal(user.user_id)}
                />
                <CustomButton
                  className="mt-4"
                  label="Delete"
                  variant="error"
                  icon={<TrashIcon />}
                  onClick={() => handleOpenDeleteUserModal(user.user_id)}
                />
                <CustomButton
                  className="mt-4"
                  label="Edit"
                  variant="secondary"
                  icon={<PencilIcon />}
                  onClick={() => handleOpenEditUserModal(user.user_id)}
                />
              </ButtonGroup>
            </Accordion>
          ))}

          {addUserModalVisible && (
            <Modal
              onClose={handleCloseAddUserModal}
              title="Invite new user"
              acceptText="Invite"
              onAccept={handleAddUser}
              isBusy={isAddingUser}
              isDisabledButton={!emailAddress.trim()}
            >
              <TextInput
                label="Email address"
                value={emailAddress}
                onChange={handleEmailAddressChange}
                required
                errorMessage="email address is required"
              />
            </Modal>
          )}

          {editUserModalVisible && (
            <Modal
              onClose={handleCloseEditUserModal}
              title="Edit user"
              acceptText="Save"
              onAccept={handleAddUser}
              isBusy={isLoadingUser}
            >
              <TextInput
                label="Nickname"
                value={nickName}
                onChange={(e) => handleNicknameChange(e)}
                required
                errorMessage="Nickname is required"
              />
              <TextInput
                label="Email address"
                value={emailAddress}
                onChange={(e) => handleEmailAddressChange(e)}
                required
                errorMessage="Email address is required"
              />
            </Modal>
          )}

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
                value={selectedRole ?? ""}
                onChange={(value: string | number) =>
                  handleRoleChange(value as Role)
                }
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
                value={selectedLevel ?? ""}
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
                value={selectedResourceName ?? ""}
                disabled={!selectedRole || !selectedLevel}
                onChange={(value: string | number) => {
                  const selected = availableResources?.find(
                    (resource) => resource.resource_name === value
                  );
                  if (selected) {
                    handleResourceChange(selected as Resource);
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
            </Modal>
          )}

          {deleteUserModalVisible && (
            <Modal
              onClose={handleCloseDeleteUserModal}
              title="Delete user"
              acceptText="Delete"
              onAccept={handleDeleteUser}
              isBusy={isDeletingUser}
            >
              <p>Are you sure you want to delete this user?</p>
            </Modal>
          )}
          {isAddingUserComplete && (
            <Toast
              variant="success"
              message="User added successfully"
              isCloseable
              onClose={() => setIsAddingUserComplete(false)}
            />
          )}

          {isDeletingUserComplete && (
            <Toast
              variant="success"
              message="User deleted successfully"
              isCloseable
              onClose={() => setIsDeletingUserComplete(false)}
            />
          )}

          {/* {isEditingUserComplete && (
            <Toast
              variant="success"
              message="User edited successfully"
              isCloseable
              onClose={() => setIsEditingUserComplete(false)}
            />
          )} */}

          {isRoleAssignmentComplete && (
            <Toast
              variant="success"
              message="Role assigned successfully"
              isCloseable
              onClose={() => setIsRoleAssignmentComplete(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default UsersPage;
