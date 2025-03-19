'use client'

import { Workshop } from '@/types/workshop.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface AttendanceRecord {
  attendance: string
  child_id: number
}

export interface ApiBody {
  date: string
  workshop_number?: number
  attendance: AttendanceRecord[]
}

const addWorkshopToTeam = async (
  teamId: number,
  data: ApiBody,
): Promise<Workshop[]> => {
  try {
    const response = await fetch(`/api/teams/${teamId}/workshops`, {
      method: 'POST',
      body: JSON.stringify(data),
    })

    const responseData: ApiResponse<Workshop[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to add workshop to team')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default addWorkshopToTeam
