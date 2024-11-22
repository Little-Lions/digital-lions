interface ApiResponse {
  date: string;
  cancelled: false;
  cancellation_reason: string;
  id: number;
  team_id: number;
}

const getWorkshops = async (): Promise<ApiResponse[]> => {
  try {
    const response = await fetch(`/api/workshops`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
