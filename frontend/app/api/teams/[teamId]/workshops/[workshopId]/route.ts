import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

interface Params {
  params: {
    teamId: string
    workshopId: string
  }
}

export async function GET(
  request: Request,
  context: Params,
): Promise<NextResponse> {
  try {
    const params = await context.params
    const { teamId, workshopId } = params

    if (!teamId || !workshopId) {
      return NextResponse.json(
        { error: 'Missing `teamId` or `workshopId` in path' },
        { status: 400 },
      )
    }

    const { accessToken } = await getAccessToken()
    if (!accessToken) throw new Error('Access token is undefined')

    const endpoint = `/teams/${teamId}/workshops/${workshopId}`

    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    console.error(
      'Error in GET /api/teams/[teamId]/workshops/[workshopId]:',
      error,
    )
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    )
  }
}
