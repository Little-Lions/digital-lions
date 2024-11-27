import { Role } from "@/types/role.type";
import { Level } from "@/types/level.type";

const getLevels = async (role: Role): Promise<Level[]> => {
  try {
    // Construct query string
    const queryParams = new URLSearchParams({ role });
    const fetchUrl = `/api/roles/levels?${queryParams.toString()}`;

    const response = await fetch(fetchUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data: Level[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getLevels;
