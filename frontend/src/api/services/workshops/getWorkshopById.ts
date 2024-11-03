import { WorkshopAttendance } from "@/types/workshopAttendance.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getWorkshopById = async (
  teamId: number,
  workshopId: number
): Promise<WorkshopAttendance> => {
  try {
    const response = await fetch(
      `${API_URL}/teams/${teamId}/workshops/${workshopId}`,
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
    const data: WorkshopAttendance = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getWorkshopById;
