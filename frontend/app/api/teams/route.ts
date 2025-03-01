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

    const url = new URL(request.url)
    const teamId = url.searchParams.get('team_id')
    const communityId = url.searchParams.get('community_id')
    const status = url.searchParams.get('status')

    // Determine the endpoint based on query parameters
    let endpoint = '/teams'
    if (teamId) {
      endpoint = `/teams/${teamId}`
    } else if (communityId) {
      endpoint = `/teams?community_id=${communityId}`
    } else if (status) {
      endpoint = `/teams?status=${status}`
    }

    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/teams:', error)
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

    const body = await request.json()

    const { message, data } = await apiRequest(
      '/teams',
      'POST',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/teams:', error)
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

// Handle DELETE requests
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const teamId = url.searchParams.get('team_id')
    const cascade = url.searchParams.get('cascade')

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing `teamId` in query parameters' },
        { status: 400 },
      )
    }

    const endpoint = `/teams/${teamId}?cascade=${cascade || 'false'}`

    const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in DELETE /api/teams:', error)
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
