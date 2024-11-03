import { TeamInCommunity } from "@/types/teamInCommunity.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getTeamsOfCommunity = async (
  communityId: number
): Promise<TeamInCommunity[]> => {
  try {
    const response = await fetch(
      `${API_URL}/teams?community_id=${communityId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.NEXT_PUBLIC_API_KEY as string,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: TeamInCommunity[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getTeamsOfCommunity;
