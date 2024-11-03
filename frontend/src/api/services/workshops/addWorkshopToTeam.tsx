import { Workshop } from "@/types/workshop.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AttendanceRecord {
    attendance: string;
    child_id: number;
  }
  
  export interface ApiBody {
    date: string;
    workshop_number: number;
    attendance: AttendanceRecord[];
  }

  const addWorkshopToTeam = async (teamId: number, data: ApiBody): Promise<Workshop[]> => {
    try {
      const response = await fetch(
        `${API_URL}/teams/${teamId}/workshops`,
        {
          method: "POST",
          headers: {
                    'Content-Type': 'application/json',
        'API-Key': process.env.NEXT_PUBLIC_API_KEY as string,
          },
          body: JSON.stringify(data),
        }
      );
  

      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const responseData: Workshop[] = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

export default addWorkshopToTeam;
