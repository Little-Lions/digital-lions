interface ApiResponse {
  date: string;
  cancelled: false;
  cancellation_reason: string;
  id: number;
  team_id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getWorkshops = async (): Promise<ApiResponse[]> => {
  try {
    const response = await fetch(`${API_URL}/workshops`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.NEXT_PUBLIC_API_KEY as string,
      },
    });
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

export default getWorkshops;
