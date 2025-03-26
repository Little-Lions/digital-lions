import { UserRoles } from '@/types/userRoles.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getRolesPerUser = async (userId: string): Promise<UserRoles[]> => {
  const response = await fetch(`/api/users?user_id=${userId}/roles`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch roles per user')
  }

  const responseData = json as ApiResponse<UserRoles[]>
  return responseData.data
}

export default getRolesPerUser
