import { Team } from "@/types/team.interface";

type teamsStatus = "active" | "non_active" | "all";

const getTeams = async (status: teamsStatus): Promise<Team[]> => {
  try {
    const response = await fetch(`/api/teams?status=${status}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: Team[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getTeams;
