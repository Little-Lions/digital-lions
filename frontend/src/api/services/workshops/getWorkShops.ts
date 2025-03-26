import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

interface Workshop {
  date: string
  cancelled: false
  cancellation_reason: string
  id: number
  team_id: number
}

const getWorkshops = async (): Promise<Workshop[]> => {
  const response = await fetch(`/api/workshops`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch workshops')
  }

  const responseData = json as ApiResponse<Workshop[]>
  return responseData.data
}

export default getWorkshops
