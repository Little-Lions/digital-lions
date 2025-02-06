'use client'

import { User } from '@/types/user.interface'
import { Role } from '@/types/role.type'

interface ApiResponse<T> {
  message: string | null
  data: T
}

export interface ApiBody {
  email: string
  roles: Role[]
}

const createUser = async (userId: string): Promise<User[]> => {
  try {
    const response = await fetch(`/api/resend-invite?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(userId),
    })

    const responseData: ApiResponse<User[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to create user invite')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default createUser
