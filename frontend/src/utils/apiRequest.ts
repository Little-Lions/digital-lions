// disable eslint rule for explicit any, because we don't know the shape of the data
// eslint-disable  @typescript-eslint/no-explicit-any
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
  const response = await fetch(fullUrl, options)

  const jsonResponse = await response.json().catch(() => null)

  if (!response.ok) {
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
