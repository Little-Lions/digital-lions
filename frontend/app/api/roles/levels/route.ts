import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (request: Request, accessToken: string) => {
  const role = new URL(request.url).searchParams.get('role')

  if (!role) {
    return NextResponse.json(
      { message: '`role` query param is required' },
      { status: 400 },
    )
  }

  const endpoint = `/roles/levels?role=${encodeURIComponent(role)}`
  const { data } = await apiRequest(endpoint, 'GET', accessToken)

  return NextResponse.json({ data })
})
