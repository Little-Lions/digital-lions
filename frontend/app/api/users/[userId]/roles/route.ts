import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const userId = url.searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const endpoint = `/users/${encodeURIComponent(userId)}/roles`
  const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

  return NextResponse.json({ message, data }, { status: 200 })
})

export const POST = withAuth(async (req: Request, accessToken: string) => {
  const userId = new URL(req.url).searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const body = await req.json()
  const endpoint = `/users/${encodeURIComponent(userId)}/roles`
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
  const userId = url.searchParams.get('user_id')
  const roleId = url.searchParams.get('role_id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  if (!roleId) {
    return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
  }

  const endpoint = `/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`
  await apiRequest(endpoint, 'DELETE', accessToken)

  return new NextResponse(null, { status: 204 })
})
