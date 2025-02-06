'use client'

import { Team } from '@/types/team.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

type teamsStatus = 'active' | 'non_active' | 'all'

const getTeams = async (status: teamsStatus): Promise<Team[]> => {
  try {
    const response = await fetch(`/api/teams?status=${status}`, {
      method: 'GET',
    })

    const responseData: ApiResponse<Team[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch teams')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getTeams
