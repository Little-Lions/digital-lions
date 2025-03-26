import { ErrorResponse } from '@/types/errorResponse.interface'

interface ApiBody {
  is_active: boolean
  age: number | null
  gender: string | null
  first_name: string
  last_name: string
}

const updateChildById = async ({
  childId,
  isActive,
  age,
  gender,
  firstName,
  lastName,
}: {
  childId: number
  isActive: boolean
  age: number | null
  gender: string | null
  firstName: string
  lastName: string
}): Promise<void> => {
  const body: ApiBody = {
    is_active: isActive,
    age,
    gender,
    first_name: firstName,
    last_name: lastName,
  }

  const response = await fetch(`/api/children?child_id=${childId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  if (response.status === 204) return

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to update child')
  }
}

export default updateChildById
