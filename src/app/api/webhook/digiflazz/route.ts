import { NextResponse } from 'next/server'

import { query } from '@/lib/db'
import { verifyDigiflazzWebhook } from '@/lib/digiflazz'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

interface DigiflazzWebhookPayload {
  ref_id?: string
  status?: string
  sn?: string | null
  buyer_sku_code?: string
  customer_no?: string
  message?: string
  rc?: string
}

function mapFulfillment(
  rawStatus: string | undefined,
): 'pending' | 'processing' | 'success' | 'failed' {
  const s = (rawStatus || '').toLowerCase()
  if (s === 'sukses' || s === 'success') return 'success'
  if (s === 'gagal' || s === 'failed') return 'failed'
  if (s === 'pending' || s === 'proses' || s === 'processing') {
    return 'processing'
  }
  return 'pending'
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = checkRateLimit(`digiflazz:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

  const raw = await request.text()

  const signature =
    request.headers.get('x-hub-signature') ??
    request.headers.get('x-hub-signature-256') ??
    ''
  // X-Hub-Signature-256 may arrive as "sha256=<hex>"; strip prefix.
  const received = signature.startsWith('sha256=')
    ? signature.slice('sha256='.length)
    : signature

  // Dev mode: when DIGIFLAZZ_WEBHOOK_SECRET is unset, accept unsigned callbacks.
  const secretConfigured = !!process.env.DIGIFLAZZ_WEBHOOK_SECRET
  if (secretConfigured && !verifyDigiflazzWebhook(raw, received)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 },
    )
  }

  let payload: DigiflazzWebhookPayload
  try {
    payload = JSON.parse(raw) as DigiflazzWebhookPayload
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 },
    )
  }

  if (!payload.ref_id) {
    return NextResponse.json(
      { error: 'Missing ref_id' },
      { status: 400 },
    )
  }

  const fulfillmentStatus = mapFulfillment(payload.status)
  try {
    await query(
      `UPDATE orders
          SET fulfillment_status = ?,
              sn = COALESCE(?, sn)
        WHERE invoice_code = ?`,
      [
        fulfillmentStatus,
        payload.sn && payload.sn.length > 0 ? payload.sn : null,
        payload.ref_id,
      ],
    )
  } catch (err) {
    console.error('digiflazz webhook update failed', err)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true, fulfillmentStatus })
}
