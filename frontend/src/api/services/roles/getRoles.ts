import { Role } from '@/types/role.type'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getRoles = async (): Promise<Role[]> => {
  const response = await fetch('/api/roles', {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch roles')
  }

  const responseData = json as ApiResponse<Role[]>
  return responseData.data
}

export default getRoles
