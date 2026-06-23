import 'server-only'
import crypto from 'node:crypto'

const API_BASE = 'https://api.digiflazz.com/v1'
const USERNAME = process.env.DIGIFLAZZ_USERNAME ?? ''
const API_KEY = process.env.DIGIFLAZZ_API_KEY ?? ''
const WEBHOOK_SECRET = process.env.DIGIFLAZZ_WEBHOOK_SECRET ?? ''

interface DigiflazzRequestPayload {
  cmd: string
  username: string
  sign: string
  data: Record<string, unknown>
}

interface DigiflazzResponse {
  data?: unknown
  message?: string
  status?: string
}

/**
 * Sign Digiflazz command per Buyer API spec:
 * MD5(username + apiKey + cmd).
 */
function signCmd(cmd: string): string {
  return crypto
    .createHash('md5')
    .update(`${USERNAME}${API_KEY}${cmd}`)
    .digest('hex')
}

/**
 * Issue a Digiflazz Buyer API request.
 */
export async function digiflazzRequest(
  cmd: string,
  payload: Record<string, unknown> = {},
): Promise<DigiflazzResponse> {
  if (!USERNAME || !API_KEY) {
    throw new Error('DIGIFLAZZ_USERNAME / DIGIFLAZZ_API_KEY not configured')
  }

  const body: DigiflazzRequestPayload = {
    cmd,
    username: USERNAME,
    sign: signCmd(cmd),
    data: payload,
  }

  const res = await fetch(`${API_BASE}/${cmd}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Digiflazz ${cmd} request failed (${res.status}): ${text.slice(0, 200)}`,
    )
  }

  return (await res.json()) as DigiflazzResponse
}

export interface DigiflazzProduct {
  buyer_sku_code: string
  product_name: string
  category: string
  brand: string
  type: string
  seller_name: string
  buyer_price: number
  buyer_sku_status: boolean
  desc: string
  tier: string
  unlimited_stock?: boolean
  stock?: number
}

/**
 * Pull the Digiflazz price-list. Each item carries the buyer_sku_code we
 * store against products.buyer_sku_code for fulfillment lookups.
 */
export async function getPriceList(): Promise<DigiflazzProduct[]> {
  const res = await digiflazzRequest('price-list', {})
  if (!Array.isArray(res.data)) return []
  return res.data as DigiflazzProduct[]
}

/**
 * Trigger a Digiflazz purchase after a successful Midtrans settlement.
 * ref_id must be unique — we reuse the invoice_code.
 */
export async function createTransaction(
  refId: string,
  buyerSkuCode: string,
  customerNo: string,
): Promise<DigiflazzResponse> {
  return digiflazzRequest('transaction', {
    ref_id: refId,
    buyer_sku_code: buyerSkuCode,
    customer_no: customerNo,
  })
}

/**
 * Verify the X-Hub-Signature header sent by Digiflazz webhooks.
 * HMAC-SHA256 of the raw body with the webhook secret, hex-encoded.
 */
export function verifyDigiflazzWebhook(
  rawBody: string,
  signature: string,
): boolean {
  // Dev mode: secret unset → caller should bypass (accept unsigned).
  // Production: secret set → require valid HMAC-SHA256.
  if (!WEBHOOK_SECRET) return true
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  if (expected.length !== signature.length) return false
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature),
    )
  } catch {
    return false
  }
}
