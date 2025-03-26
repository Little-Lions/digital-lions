import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

interface Child {
  is_active: boolean
  age: number
  dob: string
  gender: string
  first_name: string
  last_name: string
  id: number
}

interface Workshop {
  date: string
  cancelled: boolean
  cancellation_reason: string
  id: number
  team_id: number
}

interface Attendance {
  attendance: string
  child: Child
  workshop: Workshop
}

const getAttendancePerChild = async (
  attendanceId: number,
): Promise<Attendance[]> => {
  const response = await fetch(`/api/attendance/${attendanceId}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch attendance per child')
  }

  const responseData = json as ApiResponse<Attendance[]>
  return responseData.data
}

export default getAttendancePerChild
