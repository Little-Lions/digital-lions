import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0'

// import { NextResponse } from 'next/server'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
    },
  }),

  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL,
  }),
})
