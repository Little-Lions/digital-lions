'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Workshop {
  date: string
  cancelled: false
  cancellation_reason: string
  id: number
  team_id: number
}

const getWorkshops = async (): Promise<Workshop[]> => {
  try {
    const response = await fetch(`/api/workshops`, {
      method: 'GET',
    })

    const responseData: ApiResponse<Workshop[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch workshops')
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getWorkshops
