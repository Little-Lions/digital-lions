export interface ApiBody {
  email: string
}

export interface ApiResponse {
  user_id: string
  message: string
}

export interface ApiError {
  detail: string
}

const createUser = async (email: string): Promise<ApiResponse | ApiError> => {
  try {
    const response = await fetch(`/api/users`, {
      method: 'POST',
      body: JSON.stringify({ email: email }),
    })

    const responseData: ApiResponse | ApiError = await response.json()

    if (!response.ok) {
      throw new Error(
        (responseData as ApiError).detail || `Error: ${response.statusText}`,
      )
    }

    return responseData
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export default createUser
