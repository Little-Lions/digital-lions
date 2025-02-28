'use client'

import { UserRoles } from '@/types/userRoles.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getRolesPerUser = async (userId: string): Promise<UserRoles[]> => {
  try {
    const response = await fetch(`/api/users?user_id=${userId}/roles`, {
      method: 'GET',
    })

    const responseData: ApiResponse<UserRoles[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch roles per user')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getRolesPerUser
