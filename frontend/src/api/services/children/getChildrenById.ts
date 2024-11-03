interface ApiResponse {
  is_active: boolean;
  age: number;
  dob: string | null;
  gender: string | null;
  first_name: string;
  last_name: string;
  id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getChildrenById = async (childId: number): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/children/${childId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.NEXT_PUBLIC_API_KEY as string,
      },
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

export default getChildrenById;
