import { NextResponse } from 'next/server'
import { z } from 'zod'

import { query } from '@/lib/db'
import { verifyMidtransSignature } from '@/lib/midtrans'
import { createTransaction } from '@/lib/digiflazz'

export const runtime = 'nodejs'

interface OrderRow {
  id: number
  invoice_code: string
  product_id: number
  target_id: string
  zone_id: string | null
  sell_price_snapshot: number
}

const midtransNotificationSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
  payment_type: z.string().optional(),
  fraud_status: z.string().optional(),
})

type MidtransNotification = z.infer<typeof midtransNotificationSchema>

function mapPaymentStatus(
  txStatus: string,
  fraudStatus?: string,
): 'pending' | 'success' | 'failed' | 'expired' {
  switch (txStatus) {
    case 'capture':
    case 'settlement':
      return 'success'
    case 'deny':
    case 'cancel':
      return 'failed'
    case 'expire':
      return 'expired'
    case 'pending':
      return 'pending'
    default:
      if (fraudStatus === 'deny') return 'failed'
      return 'pending'
  }
}

async function triggerFulfillment(order: OrderRow): Promise<void> {
  try {
    const products = await query<{ buyer_sku_code: string | null }[]>(
      'SELECT buyer_sku_code FROM products WHERE id = ? LIMIT 1',
      [order.product_id],
    )
    const buyerSku = products?.[0]?.buyer_sku_code
    if (!buyerSku) {
      console.error(
        'triggerFulfillment: missing buyer_sku_code for product',
        order.product_id,
      )
      return
    }
    await query(
      `UPDATE orders SET fulfillment_status = 'processing' WHERE id = ?`,
      [order.id],
    )
    const customerNo =
      order.zone_id && order.zone_id.length > 0
        ? `${order.target_id}${order.zone_id}`
        : order.target_id
    await createTransaction(order.invoice_code, buyerSku, customerNo)
  } catch (err) {
    console.error('triggerFulfillment failed for', order.invoice_code, err)
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const raw = await request.text()
  let parsed: MidtransNotification
  try {
    parsed = midtransNotificationSchema.parse(JSON.parse(raw))
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 },
    )
  }

  const ok = verifyMidtransSignature(
    parsed.order_id,
    parsed.status_code,
    parsed.gross_amount,
    parsed.signature_key,
  )
  if (!ok) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 },
    )
  }

  let order: OrderRow | null = null
  try {
    const rows = await query<OrderRow[]>(
      `SELECT id, invoice_code, product_id, target_id, zone_id,
              sell_price_snapshot
         FROM orders
        WHERE invoice_code = ?
        LIMIT 1`,
      [parsed.order_id],
    )
    order = (rows?.[0] as OrderRow | undefined) ?? null
  } catch (err) {
    console.error('midtrans webhook DB lookup failed', err)
    return NextResponse.json(
      { error: 'Database unavailable' },
      { status: 503 },
    )
  }

  if (!order) {
    // Acknowledge so Midtrans stops retrying — order may have been pruned.
    return NextResponse.json({ received: true, matched: false })
  }

  const paymentStatus = mapPaymentStatus(
    parsed.transaction_status,
    parsed.fraud_status,
  )

  try {
    await query(
      `UPDATE orders
          SET payment_status = ?,
              midtrans_order_id = COALESCE(midtrans_order_id, ?)
        WHERE id = ?`,
      [paymentStatus, parsed.order_id, order.id],
    )
    if (paymentStatus === 'success') {
      await triggerFulfillment(order)
    }
  } catch (err) {
    console.error('midtrans webhook update failed', err)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true, matched: true, paymentStatus })
}
