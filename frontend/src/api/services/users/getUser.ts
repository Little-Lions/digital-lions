'use client'

import { User } from '@/types/user.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users?user_id=${userId}`, {
      method: 'GET',
    })

    const responseData: ApiResponse<User> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch user')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getUser
