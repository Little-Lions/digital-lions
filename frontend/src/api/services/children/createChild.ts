import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

export interface Child {
  id: number
  team_id: number
  first_name: string
  last_name: string
  age: number | null
  gender: string | null
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
  const response = await fetch(`/api/children`, {
    method: 'POST',
    body: JSON.stringify({
      team_id: teamId,
      age,
      gender,
      first_name: firstName,
      last_name: lastName,
    }),
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to create child')
  }

  const responseData = json as ApiResponse<Child>
  return responseData.data
}

export default createChild
