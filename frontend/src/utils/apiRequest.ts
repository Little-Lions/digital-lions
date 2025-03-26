export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  accessToken: string,
  body?: Record<string, unknown>,
): Promise<{ message: string | null; data: T }> {
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
    console.log(`[${method}] ${fullUrl}`, body ?? '')
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
        `API Error: ${response.statusText}`,
    )
  }

  return {
    message: jsonResponse?.message ?? null,
    data: jsonResponse?.data as T,
  }
}
