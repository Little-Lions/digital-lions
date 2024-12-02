interface ApiResponse {
  name: string;
  id: number;
}

const createCommunity = async (communityName: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("/api/communities", {
      method: "POST",
      body: JSON.stringify({ name: communityName }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default createCommunity;
