'use client'

import { Role } from '@/types/role.type'
import { Level } from '@/types/level.type'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getLevels = async (role: Role): Promise<Level[]> => {
  try {
    // Construct query string
    const queryParams = new URLSearchParams({ role })
    const fetchUrl = `/api/roles/levels?${queryParams.toString()}`

    const response = await fetch(fetchUrl, {
      method: 'GET',
    })

    const responseData: ApiResponse<Level[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch levels')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getLevels
