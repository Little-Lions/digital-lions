import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

interface Params {
  params: {
    workshopId: string
  }
}

export async function PATCH(
  request: Request,
  context: Params,
): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) throw new Error('Access token is undefined')

    const body = await request.json()

    const params = await context.params
    const { workshopId } = params

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Missing `workshopId` in path' },
        { status: 400 },
      )
    }

    const endpoint = `/teams/workshops/${workshopId}`

    const { message, data } = await apiRequest(
      endpoint,
      'PATCH',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    console.error('Error in PATCH /api/teams/workshops/[workshopId]:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    )
  }
}
