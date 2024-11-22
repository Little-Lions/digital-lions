const deleteChild = async (
  childId: number,
  cascade: boolean
): Promise<void> => {
  try {
    await fetch(`/api/children?child_id=${childId}&cascade=${cascade}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default deleteChild;
