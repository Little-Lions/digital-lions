import { User } from '@/types/user.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch users')
  }

  const responseData = json as ApiResponse<User[]>
  return responseData.data
}

export default getUsers
