const updateCommunity = async (
  communityId: number,
  communityName: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `/api/communities?community_id=${communityId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(communityName),
      },
    )

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default updateCommunity
