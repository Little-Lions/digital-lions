export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  accessToken: string,
  body?: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (process.env.NODE_ENV === 'development') {
    console.log(`Sending ${method} request to:`, fullUrl)
    console.log(`Request Body:`, JSON.stringify(body, null, 2))
  }
  const response = await fetch(fullUrl, options)

  const jsonResponse = await response.json().catch(() => null)

  if (process.env.NODE_ENV === 'development') {
    console.log(`API Response (${response.status}):`, jsonResponse)
  }

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${response.statusText}`)
      console.error(`API Response Detail:`, jsonResponse)
    }
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
