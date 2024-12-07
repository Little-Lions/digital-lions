import { User } from '@/types/user.interface'

const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users?user_id=${userId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    const data: User = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default getUser
