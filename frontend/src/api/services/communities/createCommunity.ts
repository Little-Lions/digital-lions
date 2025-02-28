'use client'
interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Community {
  id: number
}

const createCommunity = async (
  communityName: string,
  selectedImplementingPartnerId?: number | null,
): Promise<Community> => {
  try {
    const response = await fetch(
      `/api/communities?implementing_partner_id=${selectedImplementingPartnerId}`,
      {
        method: 'POST',
        body: JSON.stringify({ name: communityName }),
      },
    )

    const responseData: ApiResponse<Community> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to create community')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default createCommunity
