import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

interface Team {
  id: number
}

export interface BodyInput {
  name: string
  community_id: number
}

const createTeam = async ({
  name,
  communityId,
}: {
  name: string
  communityId: number
}): Promise<Team> => {
  const body: BodyInput = {
    name,
    community_id: communityId,
  }

  const response = await fetch(`/api/teams`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to create team')
  }

  const responseData = json as ApiResponse<Team>
  return responseData.data
}

export default createTeam
