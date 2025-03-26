import { User } from '@/types/user.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getCurrentUser = async (): Promise<Omit<User, 'user_id'>> => {
  const response = await fetch('/api/users/me', { method: 'GET' })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch current user')
  }

  const responseData = json as ApiResponse<User>
  delete responseData.data.user_id
  return responseData.data
}

export default getCurrentUser
