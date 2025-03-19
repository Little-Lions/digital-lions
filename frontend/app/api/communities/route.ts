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
    const implementingPartnerId = url.searchParams.get(
      'implementing_partner_id',
    )

    let endpoint = '/communities'

    if (communityId) {
      endpoint = `/communities/${communityId}`
    } else if (implementingPartnerId) {
      endpoint = `/communities?implementing_partner_id=${implementingPartnerId}`
    }

    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/communities:', error)
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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const implementingPartnerId = url.searchParams.get(
      'implementing_partner_id',
    )

    let endpoint = `/communities?implementing_partner_id=${implementingPartnerId}`
  
    const body = await request.json()

    const { message, data } = await apiRequest(
      endpoint,
      'POST',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/communities:', error)
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

    const { message, data } = await apiRequest(
      `/communities/${communityId}`,
      'PATCH',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in PATCH /api/communities:', error)
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

    const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in DELETE /api/communities:', error)
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
