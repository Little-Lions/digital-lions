import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

// Handle GET (single user or all users based on query)
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    const endpoint = userId ? `/users/${userId}` : '/users'

    const data = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// Handle POST (create user or resend invite based on payload)
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    const body = await request.json()

    const endpoint = userId ? `/resend-invite/${userId}` : '/users'

    const data = await apiRequest(endpoint, 'POST', accessToken, body)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// Handle DELETE (delete a specific user)
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()
    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    const encodedUserId = encodeURIComponent(userId)
    const endpoint = `/users/${encodedUserId}`

    await apiRequest(endpoint, 'DELETE', accessToken)

    // Return a 204 response without a body
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error in DELETE /api/users:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
