import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const teamId = url.searchParams.get('team_id')
  const communityId = url.searchParams.get('community_id')
  const status = url.searchParams.get('status')

  let endpoint = '/teams'

  if (teamId) {
    endpoint = `/teams/${encodeURIComponent(teamId)}`
  } else if (communityId) {
    endpoint = `/teams?community_id=${encodeURIComponent(communityId)}`
  } else if (status) {
    endpoint = `/teams?status=${encodeURIComponent(status)}`
  }

  const { message, data } = await apiRequest(endpoint, 'GET', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})

export const POST = withAuth(async (req: Request, accessToken: string) => {
  const body = await req.json()
  console.log('is body', body)
  const { message, data } = await apiRequest(
    '/teams',
    'POST',
    accessToken,
    body,
  )
  return NextResponse.json({ message, data }, { status: 201 })
})

export const DELETE = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const teamId = url.searchParams.get('team_id')
  const cascade = url.searchParams.get('cascade') || 'false'

  if (!teamId) {
    return NextResponse.json(
      { error: 'Missing `team_id` in query parameters' },
      { status: 400 },
    )
  }

  const endpoint = `/teams/${encodeURIComponent(teamId)}?cascade=${cascade}`
  const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)

  return NextResponse.json({ message, data }, { status: 200 })
})
