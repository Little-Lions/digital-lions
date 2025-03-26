import { ErrorResponse } from '@/types/errorResponse.interface'

const deleteChild = async (
  childId: number,
  cascade: boolean,
): Promise<void> => {
  const response = await fetch(
    `/api/children?child_id=${childId}&cascade=${cascade}`,
    {
      method: 'DELETE',
    },
  )

  if (response.status === 204) return

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to delete child')
  }
}

export default deleteChild
