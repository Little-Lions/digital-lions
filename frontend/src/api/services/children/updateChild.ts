'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

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
  try {
    const body: ApiBody = {
      is_active: isActive,
      age: age,
      gender: gender,
      first_name: firstName,
      last_name: lastName,
    }

    const response = await fetch(`/api/children?child_id=${childId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    const responseData: ApiResponse<void> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to update child')
    }
  } catch (error) {
    throw error
  }
}

export default updateChildById
