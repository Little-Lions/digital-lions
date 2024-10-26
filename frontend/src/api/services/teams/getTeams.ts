import { Team } from "@/types/team.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type teamsStatus = 'active' | 'non_active' | 'all';

const getTeams = async (status: teamsStatus): Promise<Team[]> => {
try {
  const response = await fetch(`${API_URL}/teams?status=${status}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data: Team[] = await response.json();
  return data;
} catch (error) {
  console.error('Error fetching data:', error);
  throw error;
}
};

export default getTeams;
