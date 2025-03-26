import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

interface Community {
  id: number
  name: string
}

export const getCommunities = async (
  selectedImplementingPartnerId?: number | null,
): Promise<Community[]> => {
  const response = await fetch(
    `/api/communities?implementing_partner_id=${selectedImplementingPartnerId}`,
    { method: 'GET' },
  )

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch communities')
  }

  const responseData = json as ApiResponse<Community[]>
  return responseData.data
}
