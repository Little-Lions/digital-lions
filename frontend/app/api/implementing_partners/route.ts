import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

// Handle GET requests
export async function GET(): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    let endpoint = '/implementing_partners'

    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/implementing_partners:', error)
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
      '/implementing_partners',
      'POST',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/implementingPartners:', error)
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
    const implementingPartnerId = url.searchParams.get(
      'implementing_partner_id',
    )

    if (!implementingPartnerId) {
      return NextResponse.json(
        { error: 'Missing `implementingPartnerId` in query parameters' },
        { status: 400 },
      )
    }

    const endpoint = `/implementing_partners/${implementingPartnerId}`

    const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        'Error in DELETE /api/implementingPartners/${implementing_partner_id}:',
        error,
      )
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
