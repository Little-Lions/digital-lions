import { NextResponse } from 'next/server'
import { apiRequest } from '@/utils/apiRequest'
import { withAuth } from '@/utils/routeWrapper'

export const GET = withAuth(async (req: Request, accessToken: string) => {
  const url = new URL(req.url)
  const childId = url.searchParams.get('child_id')
  const communityId = url.searchParams.get('community_id')
  const attendanceId = url.searchParams.get('attendance_id')

  let endpoint = '/attendance'

  if (attendanceId) {
    endpoint = `/attendance/${encodeURIComponent(attendanceId)}`
  } else if (childId && communityId) {
    const query = new URLSearchParams({
      child_id: childId,
      community_id: communityId,
    })
    endpoint = `/attendance?${query.toString()}`
  }

  const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

  return NextResponse.json({ message, data }, { status: 200 })
})
