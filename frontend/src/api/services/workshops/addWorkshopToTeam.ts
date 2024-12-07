import { Workshop } from '@/types/workshop.interface'

interface AttendanceRecord {
  attendance: string
  child_id: number
}

export interface ApiBody {
  date: string
  workshop_number: number
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

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const responseData: Workshop[] = await response.json()
    return responseData
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default addWorkshopToTeam
