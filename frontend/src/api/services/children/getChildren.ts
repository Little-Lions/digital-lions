import { ErrorResponse } from '@/types/errorResponse.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'

interface Child {
  first_name: string
  last_name: string
  id: number
}

const getChildren = async (communityId: number): Promise<Child[]> => {
  const response = await fetch(`/api/children?community_id=${communityId}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch children')
  }

  const responseData = json as ApiResponse<Child[]>
  return responseData.data
}

export default getChildren
