import { ErrorResponse } from '@/types/errorResponse.interface'

interface ApiInput {
  teamId: number
  cascade: boolean
}

const deleteTeam = async ({ teamId, cascade }: ApiInput): Promise<void> => {
  const response = await fetch(
    `/api/teams?team_id=${teamId}&cascade=${cascade}`,
    {
      method: 'DELETE',
    },
  )

  if (response.status === 204) return

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to delete team')
  }
}

export default deleteTeam
