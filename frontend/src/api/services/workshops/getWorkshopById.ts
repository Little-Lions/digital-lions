import { WorkshopAttendance } from '@/types/workshopAttendance.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getWorkshopById = async (
  teamId: number,
  workshopId: number,
): Promise<WorkshopAttendance> => {
  const response = await fetch(`/api/teams/${teamId}/workshops/${workshopId}`, {
    method: 'GET',
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

export default getWorkshopById
