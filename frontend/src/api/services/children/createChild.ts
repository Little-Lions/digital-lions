'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Child {
  team_id: number
  age: number | null
  gender: string | null
  first_name: string
  last_name: string
}

const createChild = async ({
  teamId,
  age,
  gender,
  firstName,
  lastName,
}: {
  teamId: number
  age: number | null
  gender: string | null
  firstName: string
  lastName: string
}): Promise<Child> => {
  try {
    const response = await fetch(`/api/children`, {
      method: 'POST',
      body: JSON.stringify({
        team_id: teamId,
        age: age,
        gender: gender,
        first_name: firstName,
        last_name: lastName,
      }),
    })

    const responseData: ApiResponse<Child> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to create child')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default createChild
