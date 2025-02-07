'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface Child {
  first_name: string
  last_name: string
  id: number
}

const getChildren = async (communityId: number): Promise<Child[]> => {
  try {
    const response = await fetch(`/api/children?community_id=${communityId}`, {
      method: 'GET',
    })

    const responseData: ApiResponse<Child[]> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch children')
    }

    return responseData.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default getChildren
