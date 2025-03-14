import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

// Handle GET requests
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    // Determine the endpoint based on query parameters
    let endpoint = '/workshops'

    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/workshops:', error)
    }
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    )
  }
}
