interface ApiBody {
  is_active: boolean
  age: number | null
  gender: string | null
  first_name: string
  last_name: string
}

const updateChildById = async ({
  childId,
  isActive,
  age,
  gender,
  firstName,
  lastName,
}: {
  childId: number
  isActive: boolean
  age: number | null
  gender: string | null
  firstName: string
  lastName: string
}): Promise<void> => {
  try {
    const body: ApiBody = {
      is_active: isActive,
      age: age,
      gender: gender,
      first_name: firstName,
      last_name: lastName,
    }

    const response = await fetch(`/api/children?child_id=${childId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error updating child data:', error)
    throw error
  }
}

export default updateChildById
