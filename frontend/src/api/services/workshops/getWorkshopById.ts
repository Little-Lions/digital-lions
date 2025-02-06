'use client'

import { WorkshopAttendance } from '@/types/workshopAttendance.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getWorkshopById = async (
  teamId: number,
  workshopId: number,
): Promise<WorkshopAttendance> => {
  try {
    const response = await fetch(
      `/api/teams/${teamId}/workshops/${workshopId}`,
      {
        method: 'GET',
      },
    )
    const responseData: ApiResponse<WorkshopAttendance> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch workshop by id')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getWorkshopById
