import { NextResponse, NextRequest } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0/edge'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/unauthorized']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next() // Allow access to public routes
  }

  // Check for static assets and skip middleware
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Check for a valid session
  try {
    const res = NextResponse.next()
    const session = await getSession(req, res)
    if (!session) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next() // Allow access if a session exists
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|icon.ico).*)', // Exclude API routes and static assets
  ],
}
