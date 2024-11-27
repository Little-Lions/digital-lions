import { User } from "@/types/user.interface";

const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch("/api/users", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data: User[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default getUsers;
