interface ApiResponse {
  id: number;
}

export interface BodyInput {
  name: string;
  community_id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createTeam = async ({
  name,
  communityId,
}: {
  name: string;
  communityId: number;
}): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/teams`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          createInput({
            name,
            communityId,
          })
        ),
      }
    );

    if (response.status === 409) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Conflict: Team already exists");
    }

    if (!response.ok) {
      throw new Error("Failed to create team");
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

function createInput({
  name,
  communityId,
}: {
  name: string;
  communityId: number;
}): BodyInput {

  return {
    name: name,
    community_id: communityId,
  };
}

export default createTeam;
