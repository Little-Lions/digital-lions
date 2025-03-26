import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (request: Request) => {
  const { accessToken } = await getAccessToken()
  if (!accessToken) {
    throw new Error('Access token is undefined')
  }

  const url = new URL(request.url)
  const role = url.searchParams.get('role')
  const level = url.searchParams.get('level') || ''

  const encodedLevel = encodeURIComponent(level)
  const endpoint = `/roles/resources?role=${role}&level=${encodedLevel}`
  const { data } = await apiRequest(endpoint, 'GET', accessToken)
  return NextResponse.json({ data })
})
