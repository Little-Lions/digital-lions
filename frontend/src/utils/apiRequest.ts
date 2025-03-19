export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  accessToken: string,
  body?: Record<string, unknown>,
): Promise<{ message: string | null; data: any }> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }

  const options: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  }

  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`

  console.log(`Sending ${method} request to:`, fullUrl)
  console.log(`Request Body:`, JSON.stringify(body, null, 2))

  const response = await fetch(fullUrl, options)
  const jsonResponse = await response.json().catch(() => null)

  console.log(`API Response (${response.status}):`, jsonResponse)

  if (!response.ok) {
    console.error(`API Error: ${response.statusText}`)
    console.error(`API Response Detail:`, jsonResponse)
    throw new Error(
      jsonResponse?.message ||
        jsonResponse?.detail ||
        `Error: ${response.statusText}`,
    )
  }

  return {
    message: jsonResponse?.message ?? null,
    data: jsonResponse?.data ?? [],
  }
}
