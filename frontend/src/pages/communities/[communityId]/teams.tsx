import React, { useState, useEffect, useCallback } from "react";

import Layout from "@/components/Layout";
import LinkCard from "@/components/LinkCard";
import TextInput from "@/components/TextInput";
import CustomButton from "@/components/CustomButton";
import Modal from "@/components/Modal";
import SkeletonLoader from "@/components/SkeletonLoader";
import EmptyState from "@/components/EmptyState";
import ToggleSwitch from "@/components/ToggleSwitch";

import { UsersIcon } from "@heroicons/react/24/solid";

import createTeam from "@/api/services/teams/createTeam";
import getTeamsOfCommunity from "@/api/services/teams/getTeamsOfCommunity";

import { TeamInCommunity } from "@/types/teamInCommunity.interface";

import { useRouter } from "next/router";
import { Team } from "@/types/team.interface";

const TeamsPage: React.FC = () => {
  const router = useRouter();
  const { communityId } = router.query;
  const [teams, setTeams] = useState<TeamInCommunity[] | Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<
    TeamInCommunity[] | Team[]
  >([]);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [communityName, setCommunityName] = useState<string | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [openAddTeamModal, setOpenAddTeamModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem("linkCardState");
    if (storedState) {
      const { communityName } = JSON.parse(storedState);
      setCommunityName(communityName);
    }
  }, []);

  const breadcrumbs = [
    { label: "Communities", path: "/communities" },
    { label: `${communityName}`, path: `/communities/${communityId}/teams` },
  ];

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const fetchedTeams = await getTeamsOfCommunity(Number(communityId));
      setTeams(fetchedTeams);
      if (isActive) {
        setFilteredTeams(fetchedTeams.filter((team) => team.is_active));
      } else {
        setFilteredTeams(fetchedTeams);
      }
      setHasLoadedInitially(true);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, communityId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleOpenTeamModal = () => {
    setOpenAddTeamModal(true);
  };

  const handleCloseTeamModal = () => {
    setOpenAddTeamModal(false);
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
  };

  const handleTeamNameBlur = (value: string) => {
    setTeamName(value);
  };

  const handleAddTeam = async () => {
    if (teamName.trim() === "") return;
    setIsAddingTeam(true);
    try {
      const newTeam = await createTeam({
        name: teamName,
        communityId: Number(communityId),
      });
      setTeams((prevTeams) => [
        ...prevTeams,
        { name: teamName, id: newTeam.id } as Team,
      ]);
      setTeamName("");
      setIsAddingTeam(false);
      setOpenAddTeamModal(false);
      await fetchTeams();
    } catch (error) {
      setIsAddingTeam(false);
      setErrorMessage(String(error));
      console.error("Error adding team:", error);
    }
  };

  const handleToggleChange = (active: boolean) => {
    setIsActive(active);
    if (active) {
      // Filter active teams
      setFilteredTeams(teams.filter((team) => team.is_active));
    } else {
      // Show all teams
      setFilteredTeams(teams);
    }
  };
  return (
    <Layout breadcrumbs={breadcrumbs}>
      {isLoading && !hasLoadedInitially ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          <div className="flex justify-between">
            <SkeletonLoader width="227px" height="40px" type="text" />
            <SkeletonLoader width="142px" type="button" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          {teams.length > 0 ? (
            <>
              <CustomButton
                label="Add team"
                onClick={handleOpenTeamModal}
                variant="primary"
                className="hover:bg-card-dark hover:text-white mb-4"
              />
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4">
                  Teams in {communityName}
                </h1>
                <ToggleSwitch onChange={handleToggleChange} />
              </div>
              {filteredTeams.map((team) => (
                <LinkCard
                  key={team.id}
                  title={team.name}
                  href={`/communities/${communityId}/teams/${team.id}`}
                  state={{ communityName, teamName: team.name }}
                  className="mb-2"
                />
              ))}
            </>
          ) : (
            <EmptyState
              title="No teams Available"
              text="Create a new team to get started"
              pictogram={<UsersIcon />}
              actionButton={
                <CustomButton
                  label="Add team"
                  onClick={handleOpenTeamModal}
                  variant="primary"
                  className="hover:bg-card-dark hover:text-white mb-4"
                />
              }
            />
          )}

          {openAddTeamModal && (
            <Modal
              onClose={handleCloseTeamModal}
              title="Add Team"
              acceptText="Add"
              onAccept={handleAddTeam}
              isBusy={isAddingTeam}
              isDisabledButton={!teamName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTeam();
                }}
              >
                <TextInput
                  className="mb-2"
                  label="Team name"
                  value={teamName}
                  onChange={handleTeamNameChange}
                  onBlur={handleTeamNameBlur}
                  autoFocus
                />
                {errorMessage && <p className="text-error">{errorMessage}</p>}
              </form>
            </Modal>
          )}
        </>
      )}
    </Layout>
  );
};

export default TeamsPage;
