import { TeamInCommunity } from '@/types/teamInCommunity.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getTeamsOfCommunity = async (
  communityId: number,
): Promise<TeamInCommunity[]> => {
  const response = await fetch(`/api/teams?community_id=${communityId}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to get teams of community')
  }

  const responseData = json as ApiResponse<TeamInCommunity[]>
  return responseData.data
}

export default getTeamsOfCommunity
