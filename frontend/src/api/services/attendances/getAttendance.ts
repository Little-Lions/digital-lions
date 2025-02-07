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

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getAttendance = async (
  childId: number,
  communityId: number,
): Promise<Attendance[]> => {
  try {
    const response = await fetch(
      `/api/attendance?child_id=${childId}&community_id=${communityId}`,
      {
        method: 'GET',
      },
    )

    const responseData: ApiResponse<Attendance[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch attendance')
    }
    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getAttendance
