import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(
  async (
    _req: Request,
    accessToken: string,
    context: { params: Record<string, string> },
  ) => {
    const { teamId } = context.params

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing `teamId` in path' },
        { status: 400 },
      )
    }

    const endpoint = `/teams/${encodeURIComponent(teamId)}/workshops`
    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  },
)

export const POST = withAuth(
  async (
    req: Request,
    accessToken: string,
    context: { params: Record<string, string> },
  ) => {
    const { teamId } = context.params

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing `teamId` in path' },
        { status: 400 },
      )
    }

    const body = await req.json()
    const endpoint = `/teams/${encodeURIComponent(teamId)}/workshops`

    const { message, data } = await apiRequest(
      endpoint,
      'POST',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 201 })
  },
)
