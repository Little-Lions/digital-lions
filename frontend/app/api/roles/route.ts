import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async () => {
  const { accessToken } = await getAccessToken()
  if (!accessToken) {
    throw new Error('Access token is undefined')
  }

  const { data } = await apiRequest('/roles', 'GET', accessToken)
  return NextResponse.json({ data })
})
