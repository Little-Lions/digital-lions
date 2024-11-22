export const apiRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  accessToken: string,
  body?: any
) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
  };

  const options: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    options
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Error from backend API: ${response.statusText}. Details: ${errorBody}`
    );
  }

  return await response.json();
};
