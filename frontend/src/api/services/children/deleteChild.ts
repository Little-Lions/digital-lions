const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getChildrenById = async (
  childId: number,
  cascade: boolean
): Promise<void> => {
  try {
    await fetch(`${API_URL}/children/${childId}?cascade=${cascade}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.NEXT_PUBLIC_API_KEY as string,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getChildrenById;
