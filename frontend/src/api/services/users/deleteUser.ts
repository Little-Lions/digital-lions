'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const deleteUser = async (userId: string): Promise<void> => {
  try {
    const encodedUserId = encodeURIComponent(userId)
    const response = await fetch(`/api/users?user_id=${encodedUserId}`, {
      method: 'DELETE',
    })

    // If the status is 204, there is no content, so consider it a success.
    if (response.status === 204) {
      return
    }

    // Otherwise, try to parse the JSON response.
    const responseData: ApiResponse<void> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to delete user')
    }
  } catch (error) {
    throw error
  }
}

export default deleteUser
