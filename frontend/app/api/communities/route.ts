import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const communityId = url.searchParams.get('community_id')
  const implementingPartnerId = url.searchParams.get('implementing_partner_id')

  let endpoint = '/communities'
  if (communityId) {
    endpoint = `/communities/${encodeURIComponent(communityId)}`
  } else if (implementingPartnerId) {
    endpoint = `/communities?implementing_partner_id=${encodeURIComponent(implementingPartnerId)}`
  }

  const { message, data } = await apiRequest(endpoint, 'GET', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})

export const POST = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const implementingPartnerId = url.searchParams.get('implementing_partner_id')

  const endpoint = `/communities?implementing_partner_id=${encodeURIComponent(implementingPartnerId || '')}`
  const body = await req.json()

  const { message, data } = await apiRequest(
    endpoint,
    'POST',
    accessToken,
    body,
  )
  return NextResponse.json({ message, data }, { status: 200 })
})

export const PATCH = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const communityId = url.searchParams.get('community_id')

  if (!communityId) {
    return NextResponse.json(
      { error: 'Missing `communityId`' },
      { status: 400 },
    )
  }

  const body = await req.json()
  const endpoint = `/communities/${encodeURIComponent(communityId)}`
  const { message, data } = await apiRequest(
    endpoint,
    'PATCH',
    accessToken,
    body,
  )

  return NextResponse.json({ message, data }, { status: 200 })
})

export const DELETE = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const communityId = url.searchParams.get('community_id')
  const cascade = url.searchParams.get('cascade') || 'false'

  if (!communityId) {
    return NextResponse.json(
      { error: 'Missing `communityId`' },
      { status: 400 },
    )
  }

  const endpoint = `/communities/${encodeURIComponent(communityId)}?cascade=${cascade}`
  const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)

  return NextResponse.json({ message, data }, { status: 200 })
})
