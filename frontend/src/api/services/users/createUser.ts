'use client'
interface ApiResponse<T> {
  message: string | null
  data: T
}

export interface ApiBody {
  email: string
}

export interface User {
  user_id: string
  message: string
}

export interface ApiError {
  detail: string
}

const createUser = async (email: string): Promise<User | ApiError> => {
  try {
    const response = await fetch(`/api/users`, {
      method: 'POST',
      body: JSON.stringify({ email: email }),
    })

    const responseData: ApiResponse<User> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to create user')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default createUser
