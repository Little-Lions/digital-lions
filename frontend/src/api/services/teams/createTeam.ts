'use client'
interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Team {
  id: number
}

export interface BodyInput {
  name: string
  community_id: number
}

const createTeam = async ({
  name,
  communityId,
}: {
  name: string
  communityId: number
}): Promise<Team> => {
  try {
    const response = await fetch(`/api/teams`, {
      method: 'POST',
      body: JSON.stringify(
        createInput({
          name,
          communityId,
        }),
      ),
    })

    const responseData: ApiResponse<Team> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to create team')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

function createInput({
  name,
  communityId,
}: {
  name: string
  communityId: number
}): BodyInput {
  return {
    name: name,
    community_id: communityId,
  }
}

export default createTeam
