import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(
  async (
    _req: Request,
    accessToken: string,
    context: { params: Record<string, string> },
  ) => {
    const { teamId, workshopId } = context.params

    if (!teamId || !workshopId) {
      return NextResponse.json(
        { error: 'Missing `teamId` or `workshopId` in path' },
        { status: 400 },
      )
    }

    const endpoint = `/teams/${encodeURIComponent(teamId)}/workshops/${encodeURIComponent(workshopId)}`
    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  },
)
