'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}
interface ApiInput {
  teamId: number
  cascade: boolean
}

const deleteTeam = async ({ teamId, cascade }: ApiInput): Promise<void> => {
  try {
    const response = await fetch(
      `/api/teams?team_id=${teamId}&cascade=${cascade}`,
      {
        method: 'DELETE',
      },
    )

    const responseData: ApiResponse<void> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to delete team')
    }
  } catch (error) {
    throw error
  }
}

export default deleteTeam
