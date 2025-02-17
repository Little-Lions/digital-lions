'use client'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getTeamsOfCommunity = async (
  communityId: number,
): Promise<TeamInCommunity[]> => {
  try {
    const response = await fetch(`/api/teams?community_id=${communityId}`, {
      method: 'GET',
    })

    const responseData: ApiResponse<TeamInCommunity[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(
        responseData.message || 'Failed to get teams of community',
      )
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getTeamsOfCommunity
