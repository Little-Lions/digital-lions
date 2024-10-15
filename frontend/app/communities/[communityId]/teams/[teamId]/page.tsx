'use client'

import React, { useState, useEffect } from "react";
import Accordion from "@/components/Accordion";
import getTeams from "@/api/services/teams/getTeams";
import getTeamById from "@/api/services/teams/getTeamById";

import createChild from "@/api/services/children/createChild";
import updateChild from "@/api/services/children/updateChild";
import deleteChild from "@/api/services/children/deleteChild";

import SelectInput from "@/components/SelectInput";
import CustomButton from "@/components/CustomButton";
import Modal from "@/components/Modal";
import TextInput from "@/components/TextInput";
import Loader from "@/components/Loader";
import ConfirmModal from "@/components/ConfirmModal";
import SkeletonLoader from "@/components/SkeletonLoader";

import EmptyState from "@/components/EmptyState";

import { UserIcon } from "@heroicons/react/24/solid";

import { TeamWithChildren } from "@/types/teamWithChildren.interface";

import { useParams, useRouter } from "next/navigation";

interface Team {
  name: string;
  id: number;
}

const TeamsDetailPage: React.FC = () => {
  const router = useRouter();
  // const { communityId, teamId } = useParams()
  // const { communityId } = useParams();

  const params = useParams();
  const communityId = params?.communityId as string;
  const teamId = params?.teamId as string;


  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithChildren | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [editChildId, setEditChildId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editAge, setEditAge] = useState<number | null>(null);
  const [editGender, setEditGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isLoadingChild, setIsLoadingChild] = useState(false);
  const [isDeletingChild, setIsDeletingChild] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [deleteChildModalVisible, setDeleteChildModalVisible] = useState(false);

  const [communityName, setCommunityName] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve and parse state from localStorage
    const storedState = localStorage.getItem("linkCardState");
    if (storedState) {
      const { communityName, teamName } = JSON.parse(storedState);
      setCommunityName(communityName);
      setTeamName(teamName);
    }
  }, []);

  // Fetch all teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const fetchedTeams = await getTeams("active");
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Fetch team details when teamId changes
  useEffect(() => {
    if (teamId) {
      const fetchTeamById = async () => {
        setIsLoadingTeam(true);
        try {
          const numericTeamId = Number(teamId);
          if (isNaN(numericTeamId)) {
            throw new Error("Invalid team ID");
          }
          const teamDetails = await getTeamById(numericTeamId);
          setSelectedTeam(teamDetails);
        } catch (error) {
          console.error("Failed to fetch team details:", error);
        } finally {
          setIsLoadingTeam(false);
        }
      };

      fetchTeamById();
    }
  }, [teamId]);

  const handleTeamChange = async (value: string | number) => {
    const selectedId = typeof value === "string" ? parseInt(value, 10) : value;
    const selected = teams.find((team) => team.id === selectedId);

    if (selected) {
      // Update the URL
      router.push(`/communities/${communityId}/teams/${selected.id}`);

      // Fetch the new team details
      setIsLoadingTeam(true);
      try {
        const teamDetails = await getTeamById(selected.id);
        setSelectedTeam(teamDetails);
      } catch (error) {
        console.error("Failed to fetch team details:", error);
      } finally {
        setIsLoadingTeam(false);
      }
    }
  };

  const handleAddChild = () => {
    setIsAddingChild(true);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditChildId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditAge(null);
    setEditGender(null);
    setIsAddingChild(false);
    setIsEditingChild(false);
  };

  const handleFirstNameChange = (value: string) => {
    setEditFirstName(value);
  };

  const handleLastNameChange = (value: string) => {
    setEditLastName(value);
  };

  const handleAgeChange = (value: string) => {
    setEditAge(parseInt(value, 10));
  };

  const handleGenderChange = (value: string) => {
    setEditGender(value);
  };

  const handleEditChild = (childId: number) => {
    setIsEditingChild(true);
    const child = selectedTeam?.children.find((c) => c.id === childId);
    if (child) {
      setEditChildId(child.id);
      setEditFirstName(child.first_name);
      setEditLastName(child.last_name);
      setEditAge(child.age);
      setEditGender(child.gender);
      setModalVisible(true);
    }
  };

  const handleSaveChild = async () => {
    if (isEditingChild && editChildId !== null) {
      if (editFirstName && editLastName) {
        const updatedChild = {
          childId: editChildId,
          isActive: true,
          age: editAge || null,
          gender: editGender || "null",
          firstName: editFirstName,
          lastName: editLastName,
        };
        setIsLoadingChild(true);
        try {
          await updateChild(updatedChild);
          const updatedTeam = await getTeamById(selectedTeam?.id as number);
          setSelectedTeam(updatedTeam);
          closeModal();
        } catch (error) {
          console.error("Failed to update child:", error);
        } finally {
          setIsLoadingChild(false);
        }
      } else {
        console.error("Missing required fields for updating child");
      }
    } else if (isAddingChild) {
      if (editFirstName && editLastName && selectedTeam) {
        const newChild = {
          teamId: selectedTeam.id,
          age: editAge,
          gender: editGender,
          firstName: editFirstName,
          lastName: editLastName,
        };
        setIsLoadingChild(true);
        try {
          await createChild(newChild);
          const updatedTeam = await getTeamById(selectedTeam.id);
          setSelectedTeam(updatedTeam);
          closeModal();
        } catch (error) {
          setErrorMessage(String(error));
          console.error("Failed to create child:", error);
        } finally {
          setIsLoadingChild(false);
        }
      } else {
        console.error("Missing required fields for adding child");
      }
    }
  };

  const openDeleteChildModal = (childId: number) => {
    setEditChildId(childId);
    setDeleteChildModalVisible(true);
  };

  const closeDeleteChildModal = () => {
    setDeleteChildModalVisible(false);
  };

  const handleDeleteChild = async () => {
    const childId = editChildId;

    setIsDeletingChild(true);
    try {
      await deleteChild(childId as number, false);
      const updatedTeam = await getTeamById(selectedTeam?.id as number);
      setSelectedTeam(updatedTeam);
      setDeleteChildModalVisible(false);
    } catch (error) {
      console.error("Failed to delete child:", error);
    } finally {
      setIsDeletingChild(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoader type="input" />
          <SkeletonLoader width="142px" type="button" />
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          {isLoadingTeam && <Loader loadingText={"Loading team details"} />}
          <SelectInput
            className="mb-4"
            label={"Select team"}
            value={selectedTeam?.id || ""}
            onChange={handleTeamChange}
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </SelectInput>

          {selectedTeam?.children.length ? (
            <CustomButton
              label="Add child"
              onClick={handleAddChild}
              variant={"primary"}
              className="hover:bg-card-dark hover:text-white mb-4"
            />
          ) : (
            <EmptyState
              title="This team has no childs"
              text="Add a child to the team to get started"
              pictogram={<UserIcon />}
              actionButton={
                <CustomButton
                  label="Add child"
                  onClick={handleAddChild}
                  variant={"primary"}
                  className="hover:bg-card-dark hover:text-white mb-4"
                />
              }
            />
          )}

          {selectedTeam && (
            <>
              {selectedTeam.children.map((child, index) => (
                <Accordion
                  key={index}
                  title={`${child.first_name} ${child.last_name}`}
                  className="mt-2"
                >
                  <div>
                    <p>{`First Name: ${child.first_name}`}</p>
                    <p>{`Last Name: ${child.last_name}`}</p>
                    <div className="flex items-center justify-end border-t mt-4 border-gray-200 rounded-b dark:border-gray-600">
                      <CustomButton
                        className="mt-4"
                        label="Delete"
                        variant="error"
                        onClick={() => openDeleteChildModal(child.id)}
                      />
                      <CustomButton
                        className="mt-4 ml-2"
                        label="Edit"
                        variant="secondary"
                        onClick={() => handleEditChild(child.id)}
                      />
                    </div>
                  </div>
                </Accordion>
              ))}
            </>
          )}
          {deleteChildModalVisible && (
            <ConfirmModal
              title="Delete child"
              text="Are you sure you want to delete this child?"
              onAccept={() => handleDeleteChild()}
              onClose={() => closeDeleteChildModal()}
              acceptText="Delete"
              closeText="Cancel"
              isBusy={isDeletingChild}
            />
          )}

          {modalVisible && (
            <Modal
              onClose={closeModal}
              title={isEditingChild ? "Edit child" : "Add child"}
              acceptText={isEditingChild ? "Edit" : "Add"}
              onAccept={handleSaveChild}
              isBusy={isLoadingChild}
              footer={
                <CustomButton
                  label="Save"
                  variant="secondary"
                  onClick={handleSaveChild}
                  isBusy={isLoadingChild}
                  className="hover:text-white"
                />
              }
            >
              <TextInput
                className="mb-2"
                label="First Name"
                value={editFirstName}
                onChange={handleFirstNameChange}
                required={true}
                errorMessage="Please enter your first name"
              />
              <TextInput
                className="mb-2"
                label="Last Name"
                value={editLastName}
                onChange={handleLastNameChange}
                required={true}
                errorMessage="Please enter your last name"
              />
              <TextInput
                className="mb-2"
                label="Age"
                value={editAge?.toString() || ""}
                onChange={handleAgeChange}
              />
              <SelectInput
                className="mb-2"
                label="Gender"
                value={editGender ?? ""}
                onChange={(value: string | number) =>
                  handleGenderChange(String(value))
                }
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </SelectInput>
              {errorMessage && <p className="text-error">{errorMessage}</p>}
            </Modal>
          )}
        </>
      )}
    </>
  );
};

export default TeamsDetailPage;
