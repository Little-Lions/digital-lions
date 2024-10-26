interface ApiInput {
  is_active: boolean;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getCommunities = async (
  communityId: string,
  input: ApiInput
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_URL}/communities/${communityId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
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
