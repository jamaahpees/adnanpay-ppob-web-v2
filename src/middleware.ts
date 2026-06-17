import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route groups like (admin) are URL-transparent. Admin pages live at:
//   /login, /dashboard, /produk, /pricing, /transaksi
// Login is public; the other four require an admin-token cookie.
// Real auth (JWT verify) lands in Task #4 — for now presence of the cookie gates access.
const PROTECTED_PATHS = ['/dashboard', '/produk', '/pricing', '/transaksi']
const LOGIN_PATH = '/login'
const TOKEN_COOKIE = 'admin-token'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(TOKEN_COOKIE)?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isLogin = pathname === LOGIN_PATH

  if (isProtected && !token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  if (isLogin && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/produk/:path*',
    '/pricing/:path*',
    '/transaksi/:path*',
    '/login',
  ],
}
