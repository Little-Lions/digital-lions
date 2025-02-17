'use client'

import { WorkshopInfo } from '@/types/workshopInfo.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getWorkshopsByTeam = async (teamId: number): Promise<WorkshopInfo[]> => {
  try {
    const response = await fetch(`/api/teams/${teamId}/workshops`, {
      method: 'GET',
    })

    const responseData: ApiResponse<WorkshopInfo[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(
        responseData.message || 'Failed to fetch workshops by team',
      )
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getWorkshopsByTeam
