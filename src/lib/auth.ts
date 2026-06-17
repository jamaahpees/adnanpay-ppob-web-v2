import 'server-only'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = process.env.ADMIN_JWT_COOKIE_NAME || 'admin-token'
const ONE_DAY_SECONDS = 60 * 60 * 24
const MAX_AGE_SECONDS = ONE_DAY_SECONDS

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not set')
  }
  return new TextEncoder().encode(secret)
}

export interface AdminTokenPayload {
  sub: string
  username: string
  role: 'admin'
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

export async function signAdminToken(
  payload: AdminTokenPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .setSubject(payload.sub)
    .sign(getJwtSecret())
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (
      typeof payload.username === 'string' &&
      payload.role === 'admin'
    ) {
      return {
        sub: payload.sub as string,
        username: payload.username,
        role: 'admin',
      }
    }
    return null
  } catch {
    return null
  }
}

export async function setAdminCookie(token: string): Promise<void> {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearAdminCookie(): Promise<void> {
  cookies().set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function getAdminTokenFromCookies(): Promise<string | null> {
  return cookies().get(COOKIE_NAME)?.value ?? null
}

export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const token = await getAdminTokenFromCookies()
  if (!token) return null
  return verifyAdminToken(token)
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME
