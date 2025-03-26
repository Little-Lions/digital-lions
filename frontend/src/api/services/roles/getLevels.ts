import { Role } from '@/types/role.type'
import { Level } from '@/types/level.type'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getLevels = async (role: Role): Promise<Level[]> => {
  const queryParams = new URLSearchParams({ role })
  const response = await fetch(`/api/roles/levels?${queryParams.toString()}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch levels')
  }

  const responseData = json as ApiResponse<Level[]>
  return responseData.data
}

export default getLevels
