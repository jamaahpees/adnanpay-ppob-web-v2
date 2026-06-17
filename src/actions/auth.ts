'use server'

import { z } from 'zod'

import { query } from '@/lib/db'
import {
  hashPassword,
  verifyPassword,
  signAdminToken,
  setAdminCookie,
} from '@/lib/auth'

interface AdminUserRow {
  id: number
  username: string
  password_hash: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(32, 'Username maksimal 32 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type LoginInput = z.infer<typeof loginSchema>

export interface LoginResult {
  username: string
  redirectTo: string
}

/**
 * Admin login server action. Verifies credentials against admin_users,
 * signs a JWT, and plants it as an HttpOnly cookie.
 *
 * If DB is unavailable, falls back to a demo credential check
 * (admin / admin123) so the build remains demoable without MySQL.
 */
export async function loginAction(
  input: LoginInput,
): Promise<ApiResponse<LoginResult>> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }
  const { username, password } = parsed.data

  try {
    const rows = await query<AdminUserRow[]>(
      'SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1',
      [username],
    )
    const user = rows?.[0]
    if (!user) {
      return { success: false, error: 'Username atau password salah' }
    }
    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) {
      return { success: false, error: 'Username atau password salah' }
    }
    return await issueAdminSession(String(user.id), user.username)
  } catch (err) {
    console.error('loginAction DB error', err)
    if (username === 'admin' && password === 'admin123') {
      return await issueAdminSession('0', 'admin', true)
    }
    return { success: false, error: 'Layanan login sedang bermasalah' }
  }
}

async function issueAdminSession(
  sub: string,
  username: string,
  demo = false,
): Promise<ApiResponse<LoginResult>> {
  try {
    const token = await signAdminToken({ sub, username, role: 'admin' })
    await setAdminCookie(token)
  } catch (err) {
    console.error('issueAdminSession failed', err)
    return { success: false, error: 'Gagal menerbitkan sesi admin' }
  }
  return {
    success: true,
    data: {
      username,
      redirectTo: '/dashboard',
    },
    ...(demo ? { error: 'Demo mode: DB tidak terhubung' } : {}),
  }
}

/**
 * Seed a demo admin on first run (admin / admin123).
 * Safe to call multiple times — it's idempotent.
 */
export async function ensureSeedAdmin(): Promise<ApiResponse<{ created: boolean }>> {
  try {
    const existing = await query<AdminUserRow[]>(
      'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
      ['admin'],
    )
    if (existing && existing.length > 0) {
      return { success: true, data: { created: false } }
    }
    const hash = await hashPassword('admin123')
    await query(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      ['admin', hash],
    )
    return { success: true, data: { created: true } }
  } catch (err) {
    console.error('ensureSeedAdmin failed', err)
    return { success: false, error: 'Gagal membuat admin awal' }
  }
}
