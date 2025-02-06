'use client'

import { Role } from '@/types/role.type'
import { Level } from '@/types/level.type'
import { Resource } from '@/types/resource.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getResources = async (role: Role, level: Level): Promise<Resource[]> => {
  try {
    const queryParams = new URLSearchParams({ role, level })

    const response = await fetch(
      `/api/roles/resources?${queryParams.toString()}`,
      {
        method: 'GET',
      },
    )

    const responseData: ApiResponse<Resource[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch resources')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getResources
