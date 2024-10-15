interface ApiResponse {
  name: string;
  id: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getCommunities = async (communityName: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "name": communityName })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default getCommunities;
