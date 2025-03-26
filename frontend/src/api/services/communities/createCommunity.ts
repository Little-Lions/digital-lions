import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
interface Community {
  id: number
}

export const createCommunity = async (
  communityName: string,
  selectedImplementingPartnerId?: number,
): Promise<Community> => {
  const response = await fetch(
    `/api/communities?implementing_partner_id=${selectedImplementingPartnerId}`,
    {
      method: 'POST',
      body: JSON.stringify({ name: communityName }),
    },
  )

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to create community')
  }

  const responseData = json as ApiResponse<Community>
  return responseData.data
}
