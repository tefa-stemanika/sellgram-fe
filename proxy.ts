import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isTokenExpired } from './services/user'
import { removeToken } from './actions/auth'

const PUBLIC_ROUTES = ['/']
const AUTH_ROUTES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (!token && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (token && !isPublicRoute && !isAuthRoute) {
    try {
      const isExpired = await isTokenExpired(token)
      console.log('ex', isExpired)
      if (isExpired) {
        removeToken()
        return
      }
    } catch (error) {
      console.error('Error checking token:', error)
      // Jika ada error checking token, izinkan user melanjutkan
      // Error handling akan ditangani di client-side
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)']
}
