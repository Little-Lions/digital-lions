import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (_req: Request, accessToken: string) => {
  const { message, data } = await apiRequest('/users/me', 'GET', accessToken)
  return NextResponse.json({ message, data }, { status: 200 })
})
