import 'server-only'

/**
 * Verify Cloudflare Turnstile token server-side.
 *
 * @param token - Turnstile response token from client widget
 * @returns true if verification succeeded, false otherwise
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping verification')
    return true
  }

  if (!token || token.length === 0) {
    return false
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }),
      },
    )

    const data = (await response.json()) as { success: boolean }
    if (!data.success) {
      console.warn('Turnstile verification failed')
    }
    return data.success
  } catch (err) {
    console.error('Turnstile verification exception:', err)
    return false
  }
}
