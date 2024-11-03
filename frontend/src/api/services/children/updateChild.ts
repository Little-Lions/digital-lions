interface ApiBody {
  is_active: boolean;
  age: number | null;
  gender: string | null;
  first_name: string;
  last_name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const updateChildById = async ({
  childId,
  isActive,
  age,
  gender,
  firstName,
  lastName,
}: {
  childId: number;
  isActive: boolean;
  age: number | null;
  gender: string | null;
  firstName: string;
  lastName: string;
}): Promise<void> => {
  try {
    const body: ApiBody = {
      is_active: isActive,
      age: age,
      gender: gender,
      first_name: firstName,
      last_name: lastName,
    };

    const response = await fetch(`${API_URL}/children/${childId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.NEXT_PUBLIC_API_KEY as string,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating child data:", error);
    throw error;
  }
};

export default updateChildById;
