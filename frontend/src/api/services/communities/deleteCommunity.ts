'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const deleteCommunity = async (
  communityId: number,
  cascade: boolean,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}&cascade=${cascade}`,
      {
        method: 'DELETE',
      },
    )

    const responseData: ApiResponse<void> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to delete community')
    }
  } catch (error) {
    throw error
  }
}

export default deleteCommunity
