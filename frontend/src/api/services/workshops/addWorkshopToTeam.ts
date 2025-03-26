import { Workshop } from '@/types/workshop.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

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
  const response = await fetch(`/api/teams/${teamId}/workshops`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to add workshop to team')
  }

  const responseData = json as ApiResponse<Workshop[]>
  return responseData.data
}

export default addWorkshopToTeam
