'use client'

import { WorkshopAttendance } from '@/types/workshopAttendance.interface'

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
  workshop_number: number
  attendance: AttendanceRecord[]
}

const updateWorkshopByTeam = async (
  workshopId: number,
  data: ApiBody,
): Promise<WorkshopAttendance> => {
  try {
    const response = await fetch(`/api/teams/workshops/${workshopId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
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

export default updateWorkshopByTeam
