import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const communityId = url.searchParams.get('community_id')

    const endpoint = communityId
      ? `/communities/${communityId}`
      : '/communities'

    const data = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/communities:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const body = await request.json()

    const data = await apiRequest('/communities', 'POST', accessToken, body)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/communities:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const body = await request.json()

    const url = new URL(request.url)
    const communityId = url.searchParams.get('community_id')

    if (!communityId) {
      return NextResponse.json(
        { error: 'Missing `communityId` in query parameters' },
        { status: 400 },
      )
    }

    const data = await apiRequest(
      `/communities/${communityId}`,
      'PATCH',
      accessToken,
      body,
    )

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in PATCH /api/communities:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const communityId = url.searchParams.get('community_id')
    const cascade = url.searchParams.get('cascade')

    if (!communityId) {
      return NextResponse.json(
        { error: 'Missing `communityId` in query parameters' },
        { status: 400 },
      )
    }

    const endpoint = `/communities/${communityId}?cascade=${cascade || 'false'}`

    await apiRequest(endpoint, 'DELETE', accessToken)

    return NextResponse.json(
      { message: 'Community deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    // Safely handle 'unknown' error
    let errorMessage = 'Internal Server Error'

    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error // Handle string error
    }

    console.error('Error in DELETE /api/communities:', error)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
