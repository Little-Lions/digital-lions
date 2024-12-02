import { WorkshopAttendance } from "@/types/workshopAttendance.interface";

const getWorkshopById = async (
  teamId: number,
  workshopId: number
): Promise<WorkshopAttendance> => {
  try {
    const response = await fetch(
      `/api/teams/${teamId}/workshops/${workshopId}`,
      {
        method: "GET",
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
