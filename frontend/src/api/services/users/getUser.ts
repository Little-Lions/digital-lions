import { User } from '@/types/user.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getUser = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users?user_id=${userId}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch user')
  }

  const responseData = json as ApiResponse<User>
  return responseData.data
}

export default getUser
