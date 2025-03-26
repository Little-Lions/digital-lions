import { User } from '@/types/user.interface'
import { ApiResponse } from '@/types/ApiResponse.interface'
import { ErrorResponse } from '@/types/errorResponse.interface'

const resendInvite = async (userId: string): Promise<User[]> => {
  const response = await fetch(
    `/api/resend-invite?user_id=${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    },
  )

  const json = await response.json()

  if (!response.ok) {
    const errorData = json as ErrorResponse
    console.error('API Error Detail:', errorData.detail)
    throw new Error(errorData.message || 'Failed to resend invite')
  }

  const responseData = json as ApiResponse<User[]>
  return responseData.data
}

export default resendInvite
