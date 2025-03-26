import { Level } from '@/types/level.type'
import { Role } from '@/types/role.type'
import { ErrorResponse } from '@/types/errorResponse.interface'

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
  const body = createOutput({ role, level, resourceId })
  const encodedUserId = encodeURIComponent(userId)

  const response = await fetch(`/api/users/${encodedUserId}/roles`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (response.status === 204) return

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to assign role to user')
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
