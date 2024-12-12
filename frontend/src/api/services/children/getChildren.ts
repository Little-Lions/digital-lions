interface ApiResponse {
  first_name: string
  last_name: string
  id: number
}

const getChildren = async (communityId: number): Promise<ApiResponse[]> => {
  try {
    const response = await fetch(`/api/children?community_id=${communityId}`, {
      method: 'GET',
    })
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }
    const data: ApiResponse[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default getChildren
