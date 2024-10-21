import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Specify which routes to apply the middleware to
  if (pathname === "/") {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|favicon.ico).*)"],
};
