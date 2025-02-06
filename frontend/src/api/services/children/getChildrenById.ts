'use client'

interface ApiResponse<T> {
  message: string | null
  data: T
}

interface ChildrenById {
  is_active: boolean
  age: number
  dob: string | null
  gender: string | null
  first_name: string
  last_name: string
  id: number
}

const getChildrenById = async (childId: number): Promise<ChildrenById> => {
  try {
    const response = await fetch(`/api/children?child_id=${childId}`, {
      method: 'GET',
    })

    const responseData: ApiResponse<ChildrenById> = await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(responseData.message || 'Failed to fetch children by id')
    }

    return responseData.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default getChildrenById
