export interface ApiBody {
  email: string;
}

export interface ApiResponse {
  user_id: string;
  message: string;
}

const createUser = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/users`, {
      method: "POST",
      body: JSON.stringify({ email: email }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData: ApiResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export default createUser;
