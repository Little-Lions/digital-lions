import { TeamInCommunity } from "@/types/teamInCommunity.interface"

const getTeamsOfCommunity = async (communityId: number): Promise<TeamInCommunity[]> => {
try {
  const response = await fetch(`https://backend-staging-ffae.up.railway.app/api/v1/teams?community_id=${communityId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data: TeamInCommunity[] = await response.json();
  return data;
} catch (error) {
  console.error('Error fetching data:', error);
  throw error;
}
};

export default getTeamsOfCommunity;
