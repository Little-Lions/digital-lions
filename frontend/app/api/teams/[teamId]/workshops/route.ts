import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

interface Params {
  params: {
    teamId: string
  }
}

export async function GET(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    const { teamId } = params

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing `teamId` in path' },
        { status: 400 },
      )
    }

    const { accessToken } = await getAccessToken()
    if (!accessToken) throw new Error('Access token is undefined')

    const endpoint = `/teams/${teamId}/workshops`

    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/teams/[teamId]/workshops:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    )
  }
}

export async function POST(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  try {
    const { teamId } = params

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing `teamId` in path' },
        { status: 400 },
      )
    }

    const { accessToken } = await getAccessToken()
    if (!accessToken) throw new Error('Access token is undefined')

    const body = await request.json()

    const endpoint = `/teams/${teamId}/workshops`

    // Call the actual API
    const { message, data } = await apiRequest(
      endpoint,
      'POST',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/teams/[teamId]/workshops:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    )
  }
}
