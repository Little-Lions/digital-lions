import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

interface ChildrenById {
  is_active: boolean
  age: number
  dob: string | null
  gender: string | null
  first_name: string
  last_name: string
  id: number
}

const getChildrenById = async (childId: number): Promise<ChildrenById> => {
  const response = await fetch(`/api/children?child_id=${childId}`, {
    method: 'GET',
  })

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to fetch children by id')
  }

  const responseData = json as ApiResponse<ChildrenById>
  return responseData.data
}

export default getChildrenById
