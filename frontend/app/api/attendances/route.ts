import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { apiRequest } from '@/utils/apiRequest'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { accessToken } = await getAccessToken()

    if (!accessToken) {
      throw new Error('Access token is undefined')
    }

    const url = new URL(request.url)
    const childId = url.searchParams.get('child_id')
    const communityId = url.searchParams.get('community_id')
    const attendanceId = url.searchParams.get('attendance_id')

    // Determine endpoint based on query parameters
    let endpoint = '/attendance'
    if (attendanceId) {
      endpoint = `/attendance/${attendanceId}`
    } else if (childId) {
      endpoint = `/attendance?child_id=${childId}&community_id=${communityId}`
    }
    const { message, data } = await apiRequest(endpoint, 'GET', accessToken)

    return NextResponse.json({ message, data }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/attendance:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    )
  }
}
