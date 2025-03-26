import { WorkshopInfo } from '@/types/workshopInfo.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getWorkshopsByTeam = async (teamId: number): Promise<WorkshopInfo[]> => {
  const response = await fetch(`/api/teams/${teamId}/workshops`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch workshops by team')
  }

  const responseData = json as ApiResponse<WorkshopInfo[]>
  return responseData.data
}

export default getWorkshopsByTeam
