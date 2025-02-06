'use client'

import { Role } from '@/types/role.type'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch('/api/roles', {
      method: 'GET',
    })

    const responseData: ApiResponse<Role[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch roles')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getRoles
