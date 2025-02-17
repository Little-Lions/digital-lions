'use client'

import { Level } from '@/types/level.type'
import { Role } from '@/types/role.type'

interface ApiResponse<T> {
  message: string | null
  data: T
}

export interface ApiBody {
  role: Role
  level: Level
  resource_id: number
}

export interface ApiInput {
  role: Role
  level: Level
  resourceId: number
}

const assignRoleToUser = async (
  userId: string,
  role: Role,
  level: Level,
  resourceId: number,
): Promise<void> => {
  try {
    const body = createOutput({ role, level, resourceId })
    const encodedUserId = encodeURIComponent(userId)
    const response = await fetch(`/api/users/${encodedUserId}/roles`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const responseData: ApiResponse<void> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to assign role to user')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

function createOutput(data: ApiInput): ApiBody {
  return {
    role: data.role,
    level: data.level,
    resource_id: data.resourceId,
  }
}

export default assignRoleToUser
