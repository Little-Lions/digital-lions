import { TeamWithChildren} from '@/types/teamWithChildren.interface'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getTeamById = async (teamsId: number): Promise<TeamWithChildren> => {
  try {
    const response = await fetch(`${API_URL}/teams/${teamsId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
