interface Child {
  is_active: boolean;
  age: number;
  dob: string;
  gender: string;
  first_name: string;
  last_name: string;
  id: number;
}

interface Workshop {
  date: string;
  cancelled: boolean;
  cancellation_reason: string;
  id: number;
  team_id: number;
}

interface ApiResponse {
  attendance: string;
  child: Child;
  workshop: Workshop;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAttendance = async (
  childId: number,
  communityId: number
): Promise<ApiResponse[]> => {
  try {
    const response = await fetch(
      `${API_URL}/attendance?child_id=${childId}&community_id=${communityId}`,
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

    const data: ApiResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getAttendance;
