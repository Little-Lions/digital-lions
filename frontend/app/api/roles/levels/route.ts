import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (req) => {
  const { accessToken } = await getAccessToken()
  if (!accessToken) {
    throw new Error('Access token is undefined')
  }

  const role = new URL(req.url).searchParams.get('role')
  const endpoint = `/roles/levels?role=${role}`
  const { data } = await apiRequest(endpoint, 'GET', accessToken)
  return NextResponse.json({ data })
})
