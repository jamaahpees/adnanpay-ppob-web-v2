/**
 * Lightweight in-memory rate limiter for API routes.
 *
 * WARNING: State lives in process memory — reset on deploy/restart.
 * For multi-instance production, swap with Upstash/Vercel KV store.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Periodic cleanup every 60s to avoid unbounded growth
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function reap(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  store.forEach((entry, key) => {
    if (now >= entry.resetAt) store.delete(key)
  })
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given key.
 *
 * @param key  Unique identifier (e.g. `ip:route`)
 * @param max  Max requests allowed within window
 * @param windowMs  Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  max = 10,
  windowMs = 60_000,
): RateLimitResult {
  reap()
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs }
    store.set(key, entry)
    return { allowed: true, remaining: max - 1, resetAt: entry.resetAt }
  }

  entry.count++
  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt }
}
