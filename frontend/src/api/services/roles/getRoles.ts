import { Role } from "@/types/role.type";

const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch("/api/roles", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: Role[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getRoles;
