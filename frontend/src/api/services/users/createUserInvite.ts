import { User } from "@/types/user.interface";
import { Roles } from "@/types/role.type";

export interface ApiBody {
  email: string;
  roles: Roles[];
}

const createUser = async (userId: string): Promise<User[]> => {
  try {
    const response = await fetch(`/api/resend-invite?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData: User[] = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export default createUser;
