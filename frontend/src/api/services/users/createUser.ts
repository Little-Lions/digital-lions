import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

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
  const response = await fetch(`/api/users`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to create user')
  }

  const responseData = json as ApiResponse<User>
  return responseData.data
}

export default createUser
