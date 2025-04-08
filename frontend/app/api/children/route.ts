import { NextResponse } from 'next/server'
import { withAuth } from '@/utils/routeWrapper'
import { apiRequest } from '@/utils/apiRequest'

export const GET = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const childId = url.searchParams.get('child_id')
  const communityId = url.searchParams.get('community_id')

  let endpoint = '/children'
  if (childId) {
    endpoint = `/children/${encodeURIComponent(childId)}`
  } else if (communityId) {
    endpoint = `/children?community_id=${encodeURIComponent(communityId)}`
  }

  const { message, data } = await apiRequest(endpoint, 'GET', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})

export const POST = withAuth(async (req: Request, accessToken: string) => {
  const body = await req.json()
  const { message, data } = await apiRequest(
    '/children',
    'POST',
    accessToken,
    body,
  )
  return NextResponse.json({ message, data }, { status: 201 })
})

export const DELETE = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const childId = url.searchParams.get('child_id')
  const cascade = url.searchParams.get('cascade')

  if (!childId) {
    return NextResponse.json({ error: 'Missing `childId`' }, { status: 400 })
  }

  const endpoint = `/children/${encodeURIComponent(childId)}?cascade=${cascade || 'false'}`
  const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})

export const PATCH = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const childId = url.searchParams.get('child_id')

  if (!childId) {
    return NextResponse.json({ error: 'Missing `childId`' }, { status: 400 })
  }

  const body = await req.json()
  const endpoint = `/children/${encodeURIComponent(childId)}`
  const { message, data } = await apiRequest(
    endpoint,
    'PATCH',
    accessToken,
    body,
  )

  return NextResponse.json({ message, data }, { status: 200 })
})
