import { TeamWithChildren } from '@/types/teamWithChildren.interface'

const deleteCommunity = async (
  communityId: number,
  cascade: boolean,
): Promise<TeamWithChildren> => {
  try {
    const response = await fetch(
      `/api/communities?team_id=${communityId}&cascade=${cascade}`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data: TeamWithChildren = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default deleteCommunity
