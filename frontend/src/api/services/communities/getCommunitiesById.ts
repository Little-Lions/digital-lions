interface ApiResponse {
  name: string;
  id: number;
}

const getCommunitiesById = async (
  communityId: string
): Promise<ApiResponse[]> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}`,
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

    const data: ApiResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getCommunitiesById;
