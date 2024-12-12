import { Level } from '@/types/level.type'
import { Role } from '@/types/role.type'

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

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error creating user:', error)
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
