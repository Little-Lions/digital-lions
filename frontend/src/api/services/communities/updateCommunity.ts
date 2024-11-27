interface ApiInput {
  is_active: boolean;
  name: string;
}

const getCommunities = async (
  communityId: string,
  input: ApiInput
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getCommunities;
