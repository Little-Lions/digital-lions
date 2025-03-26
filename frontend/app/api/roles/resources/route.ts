import { NextResponse } from 'next/server'
import { withAuth } from '@/utils/routeWrapper'
import { apiRequest } from '@/utils/apiRequest'

export const GET = withAuth(async (request: Request, accessToken: string) => {
  const url = new URL(request.url)
  const role = url.searchParams.get('role')
  const level = url.searchParams.get('level')

  if (!role || !level) {
    return NextResponse.json(
      { message: '`role` and `level` query params are required' },
      { status: 400 },
    )
  }

  const endpoint = `/roles/resources?role=${encodeURIComponent(role)}&level=${encodeURIComponent(level)}`
  const { data } = await apiRequest(endpoint, 'GET', accessToken)

  return NextResponse.json({ data })
})
