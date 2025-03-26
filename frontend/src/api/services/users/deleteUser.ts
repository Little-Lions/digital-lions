import { ErrorResponse } from '@/types/errorResponse.interface'

const deleteUser = async (userId: string): Promise<void> => {
  const encodedUserId = encodeURIComponent(userId)
  const response = await fetch(`/api/users?user_id=${encodedUserId}`, {
    method: 'DELETE',
  })

  if (response.status === 204) return

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to delete user')
  }
}

export default deleteUser
