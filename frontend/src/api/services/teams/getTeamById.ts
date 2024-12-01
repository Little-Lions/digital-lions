"use client";

import { TeamWithChildren } from "@/types/teamWithChildren.interface";

const getTeamById = async (teamId: number): Promise<TeamWithChildren> => {
  try {
    const response = await fetch(`/api/teams?team_id=${teamId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: TeamWithChildren = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getTeamById;
