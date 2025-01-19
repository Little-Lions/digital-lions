const deleteChild = async (
  childId: number,
  cascade: boolean,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/children?child_id=${childId}&cascade=${cascade}`,
      {
        method: 'DELETE',
      },
    )

    // Check for HTTP errors
    if (!response.ok) {
      const errorBody = await response.json()
      throw new Error(errorBody.error || 'Failed to delete child')
    }
  } catch (error) {
    console.error('Error deleting child:', error)
    throw error
  }
}

export default deleteChild
