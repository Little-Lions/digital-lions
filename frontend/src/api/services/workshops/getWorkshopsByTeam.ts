import { WorkshopInfo } from "@/types/workshopInfo.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getWorkshopsByTeam = async (teamId: number): Promise<WorkshopInfo[]> => {
  try {
    const response = await fetch(
      `${API_URL}/teams/${teamId}/workshops`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: WorkshopInfo[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getWorkshopsByTeam;
