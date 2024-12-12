export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  accessToken: string,

  // disable no explcitit any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any,
): Promise<void> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    'API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
  }

  const options: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  }

  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`
  console.log('fullURL', fullUrl)
  const response = await fetch(fullUrl, options)

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Error from backend API: ${response.statusText}. Details: ${errorBody}`,
    )
  }

  if (response.status === 204) {
    return
  }

  return await response.json()
}
