import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest' // Reuse the utility function for API calls

// Handle GET requests
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const teamId = url.searchParams.get('team_id')
    const workshopId = url.searchParams.get('workshop_id')

    // Determine the endpoint based on query parameters
    let endpoint = '/workshops'
    if (teamId) {
      endpoint = `/teams/${teamId}/workshops`
    } else if (workshopId) {
      endpoint = `/teams/${teamId}/workshops/${workshopId}`
    } else {
      endpoint = '/workshops'
    }

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

// Handle POST requests
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const teamId = url.searchParams.get('team_id')

    const body = await request.json()

    const endpoint = `/teams/${teamId}/workshops`
    const { message, data } = await apiRequest(
      endpoint,
      'POST',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/workshops:', error)
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
