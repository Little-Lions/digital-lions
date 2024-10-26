interface ApiResponse {
  name: string;
  id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getCommunities = async (): Promise<ApiResponse[]> => {
  try {
    const response = await fetch(`${API_URL}/communities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: ApiResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default getCommunities;