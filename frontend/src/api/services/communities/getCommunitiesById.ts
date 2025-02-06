'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Community {
  id: number
  name: string
}

const getCommunitiesById = async (
  communityId: string,
): Promise<Community[]> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}`,
      {
        method: 'GET',
      },
    )

    const responseData: ApiResponse<Community[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch communities')
    }

    return responseData.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default getCommunitiesById
