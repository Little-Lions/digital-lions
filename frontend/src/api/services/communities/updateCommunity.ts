const updateCommunity = async (
  communityId: number,
  communityName: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name: communityName }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.json()
      throw new Error(
        `Error: ${response.statusText}. Message: ${errorBody.message || 'Unknown error'}`,
      )
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default updateCommunity
