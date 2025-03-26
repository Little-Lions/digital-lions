import { TeamWithChildren } from '@/types/teamWithChildren.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getTeamById = async (teamId: number): Promise<TeamWithChildren> => {
  const response = await fetch(`/api/teams?team_id=${teamId}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch team by id')
  }

  const responseData = json as ApiResponse<TeamWithChildren>
  return responseData.data
}

export default getTeamById
