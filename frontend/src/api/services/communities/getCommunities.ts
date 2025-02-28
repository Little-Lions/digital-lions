'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Community {
  id: number
  name: string
}

const getCommunities = async (
  selectedImplementingPartnerId?: number | null,
): Promise<Community[]> => {
  console.log('selectedImplementingPartnerId', selectedImplementingPartnerId)
  try {
    const response = await fetch(
      `/api/communities?implementing_partner_id=${selectedImplementingPartnerId}`,
      { method: 'GET' },
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
    throw error
  }
}

export default getCommunities
