import { NextResponse } from 'next/server'
import { getAccessToken } from '@auth0/nextjs-auth0'

export function withAuth(
  handler: (req: Request, accessToken: string) => Promise<NextResponse>,
) {
  return async (req: Request) => {
    try {
      const { accessToken } = await getAccessToken()
      if (!accessToken) throw new Error('Access token undefined')

      return await handler(req, accessToken)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error)
      return NextResponse.json(
        {
          message:
            error instanceof Error ? error.message : 'Internal Server Error',
        },
        { status: 500 },
      )
    }
  }
}
