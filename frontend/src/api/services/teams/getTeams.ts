import { Team } from '@/types/team.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

type TeamsStatus = 'active' | 'non_active' | 'all'

const getTeams = async (status: TeamsStatus): Promise<Team[]> => {
  const response = await fetch(`/api/teams?status=${status}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch teams')
  }

  const responseData = json as ApiResponse<Team[]>
  return responseData.data
}

export default getTeams
