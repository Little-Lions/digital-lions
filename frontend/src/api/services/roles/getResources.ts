import { Role } from "@/types/role.type";
import { Level } from "@/types/level.type";
import { Resource } from "@/types/resource.interface";

const getResources = async (
  role: Role,
  decodedLevel: Level
): Promise<Resource[]> => {
  try {
    const level = encodeURIComponent(decodedLevel);
    const queryParams = new URLSearchParams({ role, level });

    const response = await fetch(
      `/api/roles/resources?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: Resource[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
};

export default getResources;
