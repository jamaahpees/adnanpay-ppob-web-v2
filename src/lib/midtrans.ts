import 'server-only'
import crypto from 'node:crypto'

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ''
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY ?? ''

const SNAP_BASE_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1'

export interface MidtransOrderInput {
  invoiceCode: string
  grossAmount: number
  itemName: string
  customerContact?: string
}

export interface MidtransSnapResponse {
  token: string
  redirect_url: string
}

export function getMidtransClientKey(): string {
  return CLIENT_KEY
}

/**
 * Create a Snap transaction at Midtrans.
 * Returns snap_token + redirect_url on success.
 */
export async function createSnapTransaction(
  order: MidtransOrderInput,
): Promise<MidtransSnapResponse> {
  if (!SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured')
  }

  const auth = Buffer.from(`${SERVER_KEY}:`).toString('base64')
  const body = {
    transaction_details: {
      order_id: order.invoiceCode,
      gross_amount: Math.round(order.grossAmount),
    },
    item_details: [
      {
        id: order.invoiceCode,
        name: order.itemName.slice(0, 50),
        price: Math.round(order.grossAmount),
        quantity: 1,
      },
    ],
    customer_details: order.customerContact
      ? { phone: order.customerContact }
      : undefined,
  }

  const res = await fetch(`${SNAP_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Midtrans Snap request failed (${res.status}): ${text.slice(0, 200)}`,
    )
  }

  const json = (await res.json()) as MidtransSnapResponse
  return json
}

/**
 * Verify a Midtrans webhook notification signature.
 * Signature = SHA512(order_id + status_code + gross_amount + SERVER_KEY).
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  if (!SERVER_KEY) return false
  const expected = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${SERVER_KEY}`)
    .digest('hex')
  return (
    expected.length === signatureKey.length &&
    crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureKey),
    )
  )
}
