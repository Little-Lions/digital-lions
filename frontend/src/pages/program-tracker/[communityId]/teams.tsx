import React, { useState, useEffect, useCallback } from "react";

import Layout from "@/components/Layout";
import LinkCard from "@/components/LinkCard";
import CustomButton from "@/components/CustomButton";
import SkeletonLoader from "@/components/SkeletonLoader";
import EmptyState from "@/components/EmptyState";

import { UsersIcon } from "@heroicons/react/24/solid";

import getTeamsOfCommunity from "@/api/services/teams/getTeamsOfCommunity";

import { TeamInCommunity } from "@/types/teamInCommunity.interface";

import { useRouter } from "next/router";
import { Team } from "@/types/team.interface";

const ProgramTrackerTeamsPage: React.FC = () => {
  const router = useRouter();
  const { communityId } = router.query;
  const [teams, setTeams] = useState<TeamInCommunity[] | Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [communityName, setCommunityName] = useState<string | null>(null);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem("linkCardState");
    if (storedState) {
      const { communityName } = JSON.parse(storedState);
      setCommunityName(communityName);
    }
  }, []);

  const breadcrumbs = [
    { label: "Program tracker", path: "/program-tracker" },
    { label: `${communityName}`, path: `/program-tracker/${communityId}/teams` },
  ];

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const fetchedTeams = await getTeamsOfCommunity(Number(communityId));
      setTeams(fetchedTeams);
      setHasLoadedInitially(true);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <Layout breadcrumbs={breadcrumbs}>
      {isLoading && !hasLoadedInitially ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLoader key={i} height="132px" type="card" />
          ))}
        </>
      ) : (
        <>
          {teams.length > 0 ? (
            <>
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4">
                  Teams in {communityName}
                </h1>
              </div>
              {teams.map((team) => (
                <LinkCard
                  key={team.id}
                  title={team.name}
                  href={`/program-tracker/${communityId}/teams/${team.id}`}
                  state={{ communityName: communityName, teamName: team.name }}
                  className="mb-2"
                >

                  <div className="border-2 border-dashed flex flex-col p-2">
                    <span>Workshop: 9/12</span>
                    <span>Latest active</span>
                    <span>Coach: A</span>
                  </div>
                </LinkCard>
              ))}
            </>
          ) : (
            <EmptyState
              title="No teams available"
              text="The button below will take you to the team management page where you can add a new team."
              pictogram={<UsersIcon />}
              actionButton={
                <CustomButton
                  label="Add team"
                  onClick={() => router.push(`/communities/${communityId}/teams`)}
                  variant="primary"
                  className="hover:bg-card-dark hover:text-white mb-4"
                />
              }
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default ProgramTrackerTeamsPage;
