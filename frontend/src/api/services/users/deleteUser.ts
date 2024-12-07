const deleteUser = async (userId: string): Promise<void> => {
  try {
    const encodedUserId = encodeURIComponent(userId)
    const response = await fetch(`/api/users?user_id=${encodedUserId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`)
    }

    if (response.status === 204) {
      return
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export default deleteUser
