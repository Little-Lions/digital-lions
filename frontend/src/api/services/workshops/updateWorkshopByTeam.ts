import { WorkshopAttendance } from '@/types/workshopAttendance.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

interface AttendanceRecord {
  attendance: string
  child_id: number
}

export interface ApiBody {
  date: string
  attendance: AttendanceRecord[]
}

const updateWorkshopByTeam = async (
  workshopId: number,
  data: ApiBody,
): Promise<WorkshopAttendance> => {
  const response = await fetch(`/api/teams/workshops/${workshopId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch workshop by id')
  }

  const responseData = json as ApiResponse<WorkshopAttendance>
  return responseData.data
}

export default updateWorkshopByTeam
