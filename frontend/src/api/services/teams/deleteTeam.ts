import { TeamWithChildren } from '@/types/teamWithChildren.interface'

interface ApiInput {
  teamId: number
  cascade: boolean
}

const deleteTeam = async ({
  teamId,
  cascade,
}: ApiInput): Promise<TeamWithChildren> => {
  try {
    const response = await fetch(
      `/api/teams?team_id=${teamId}&cascade=${cascade}`,
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
    console.error('Error deleting team:', error)
    throw error
  }
}

export default deleteTeam
