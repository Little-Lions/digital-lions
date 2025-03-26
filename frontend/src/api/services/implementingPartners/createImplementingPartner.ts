import { ImplementingPartner } from '@/types/implementingPartner.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const createImplementingPartners = async (
  implementingPartnerName: string,
): Promise<ImplementingPartner> => {
  const response = await fetch(`/api/implementing_partners`, {
    method: 'POST',
    body: JSON.stringify({ name: implementingPartnerName }),
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(
      errorData.message || 'Failed to create implementing partner',
    )
  }

  const responseData = json as ApiResponse<ImplementingPartner>
  return responseData.data
}

export default createImplementingPartners
