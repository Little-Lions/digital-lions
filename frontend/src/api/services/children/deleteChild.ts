const deleteChild = async (
  childId: number,
  cascade: boolean,
): Promise<void> => {
  try {
    await fetch(`/api/children?child_id=${childId}&cascade=${cascade}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export default deleteChild
