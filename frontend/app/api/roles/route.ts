import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (_request: Request, accessToken: string) => {
  const { data } = await apiRequest('/roles', 'GET', accessToken)
  return NextResponse.json({ data })
})
