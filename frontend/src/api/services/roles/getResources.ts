import { Role } from '@/types/role.type'
import { Level } from '@/types/level.type'
import { Resource } from '@/types/resource.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const getResources = async (role: Role, level: Level): Promise<Resource[]> => {
  const queryParams = new URLSearchParams({ role, level })
  const response = await fetch(
    `/api/roles/resources?${queryParams.toString()}`,
    {
      method: 'GET',
    },
  )

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch resources')
  }

  const responseData = json as ApiResponse<Resource[]>
  return responseData.data
}

export default getResources
