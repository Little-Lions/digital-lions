interface ApiResponse {
  team_id: number;
  age: number | null;
  gender: string | null;
  first_name: string;
  last_name: string;
}

const createChild = async ({
  teamId,
  age,
  gender,
  firstName,
  lastName,
}: {
  teamId: number;
  age: number | null;
  gender: string | null;
  firstName: string;
  lastName: string;
}): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/children`, {
      method: "POST",
      body: JSON.stringify({
        team_id: teamId,
        age: age,
        gender: gender,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (response.status === 409) {
      const errorData = await response.json();
      throw errorData.detail;
      // throw new Error(errorData.detail || "Conflict: Child already exists");
    }

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

export default createChild;
