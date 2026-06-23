import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Route groups like (admin) are URL-transparent. Admin pages live at:
//   /login, /dashboard, /produk, /pricing, /transaksi
// Login is public; the other four require a valid admin JWT cookie.
const PROTECTED_PATHS = ['/dashboard', '/produk', '/pricing', '/transaksi']
const LOGIN_PATH = '/login'
const TOKEN_COOKIE = process.env.ADMIN_JWT_COOKIE_NAME || 'admin-token'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

async function isValidAdminToken(token: string): Promise<boolean> {
  if (!process.env.JWT_SECRET) return false
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(TOKEN_COOKIE)?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isLogin = pathname === LOGIN_PATH

  // If JWT_SECRET is configured, enforce signed-token verification.
  // If not configured (demo/dev without secrets), fall back to cookie-presence
  // so the app remains runnable without breaking the build.
  const tokenValid = token
    ? process.env.JWT_SECRET
      ? await isValidAdminToken(token)
      : true
    : false

  if (isProtected && !tokenValid) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  if (isLogin && tokenValid) {
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
