import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (_req: Request, accessToken: string) => {
  const endpoint = '/implementing_partners'
  const { message, data } = await apiRequest(endpoint, 'GET', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})

export const POST = withAuth(async (req: Request, accessToken: string) => {
  const body = await req.json()
  const endpoint = '/implementing_partners'
  const { message, data } = await apiRequest(
    endpoint,
    'POST',
    accessToken,
    body,
  )
  return NextResponse.json({ message, data }, { status: 201 })
})

export const DELETE = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const implementingPartnerId = url.searchParams.get('implementing_partner_id')

  if (!implementingPartnerId) {
    return NextResponse.json(
      { error: 'Missing `implementing_partner_id` in query parameters' },
      { status: 400 },
    )
  }

  const endpoint = `/implementing_partners/${encodeURIComponent(implementingPartnerId)}`
  const { message, data } = await apiRequest(endpoint, 'DELETE', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})
