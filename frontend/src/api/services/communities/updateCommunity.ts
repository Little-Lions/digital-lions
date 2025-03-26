import { ErrorResponse } from '@/types/errorResponse.interface'

const updateCommunity = async (
  communityId: number,
  communityName: string,
): Promise<void> => {
  const response = await fetch(`/api/communities?community_id=${communityId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: communityName }),
  })

  if (response.status === 204) return

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to update community')
  }
}

export default updateCommunity
