'use client'

import { TeamWithChildren } from '@/types/teamWithChildren.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getTeamById = async (teamId: number): Promise<TeamWithChildren> => {
  try {
    const response = await fetch(`/api/teams?team_id=${teamId}`, {
      method: 'GET',
    })

    const responseData: ApiResponse<TeamWithChildren> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch team by id')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getTeamById
