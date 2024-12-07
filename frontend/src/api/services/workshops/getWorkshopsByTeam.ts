import { WorkshopInfo } from '@/types/workshopInfo.interface'

const getWorkshopsByTeam = async (teamId: number): Promise<WorkshopInfo[]> => {
  try {
    const response = await fetch(`/api/teams/${teamId}/workshops`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data: WorkshopInfo[] = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default getWorkshopsByTeam
