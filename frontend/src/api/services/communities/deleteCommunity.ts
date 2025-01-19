const deleteCommunity = async (
  communityId: number,
  cascade: boolean,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}&cascade=${cascade}`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      const errorBody = await response.json()
      throw new Error(
        `Error: ${response.statusText}. Message: ${errorBody.message || 'Unknown error'}`,
      )
    }
  } catch (error) {
    console.error('Error deleting community:', error)
    throw error
  }
}

export default deleteCommunity
