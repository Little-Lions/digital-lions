import { TeamWithChildren } from "@/types/teamWithChildren.interface";

interface ApiInput {
  teamId: number;
  cascade: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const deleteTeam = async ({
  teamId,
  cascade,
}: ApiInput): Promise<TeamWithChildren> => {
  try {
    const response = await fetch(
      `${API_URL}/teams/${teamId}?cascade=${cascade}
`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.NEXT_PUBLIC_API_KEY as string,
        },
      }
    );

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

export default deleteTeam;
