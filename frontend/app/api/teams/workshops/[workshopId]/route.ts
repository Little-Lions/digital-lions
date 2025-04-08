import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const PATCH = withAuth(
  async (
    req: Request,
    accessToken: string,
    context: { params: Record<string, string> },
  ) => {
    const { workshopId } = context.params
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Missing `workshopId` in path' },
        { status: 400 },
      )
    }

    const body = await req.json()
    const endpoint = `/teams/workshops/${encodeURIComponent(workshopId)}`
    const { message, data } = await apiRequest(
      endpoint,
      'PATCH',
      accessToken,
      body,
    )

    return NextResponse.json({ message, data }, { status: 200 })
  },
)
