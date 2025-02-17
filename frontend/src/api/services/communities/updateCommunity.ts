'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const updateCommunity = async (
  communityId: number,
  communityName: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name: communityName }),
      },
    )

    const responseData: ApiResponse<void> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to update community')
    }
  } catch (error) {
    throw error
  }
}

export default updateCommunity
