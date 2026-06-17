'use server'

import { z } from 'zod'

import { query } from '@/lib/db'
import { resolvePrice } from '@/lib/pricing'
import { createSnapTransaction } from '@/lib/midtrans'
import type { ProductCategory } from '@/lib/pricing'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface ProductRow {
  id: number
  sku: string
  name: string
  category: ProductCategory
  base_price: number
  buyer_sku_code: string | null
  needs_zone: number
  is_active: number
}

export interface OrderRow {
  id: number
  invoice_code: string
  product_id: number
  product_name_snapshot: string
  target_id: string
  zone_id: string | null
  base_price_snapshot: number
  sell_price_snapshot: number
  profit: number
  payment_status: string
  fulfillment_status: string
  sn: string | null
  midtrans_order_id: string | null
  created_at: string
}

export interface CreateOrderResult {
  invoiceCode: string
  snapToken: string | null
  redirectUrl: string | null
  sellPrice: number
  mock: boolean
}

const createOrderSchema = z.object({
  productId: z.number().int().positive(),
  targetId: z
    .string()
    .trim()
    .min(8, 'ID tujuan minimal 8 digit')
    .max(50, 'ID tujuan terlalu panjang'),
  zoneId: z.string().trim().max(20).optional().or(z.literal('')),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

function generateInvoiceCode(): string {
  const now = new Date()
  const ymd =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')
  const suffix = Array.from({ length: 4 }, () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return chars[Math.floor(Math.random() * chars.length)]
  }).join('')
  return `INV-${ymd}-${suffix}`
}

/**
 * ATOMIC order creation. Server reads base_price from DB and resolves
 * pricing server-side — client never supplies trusted final pricing.
 * On Midtrans unavailability, returns a mock order so the demo flow
 * still redirects to the invoice page.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<ApiResponse<CreateOrderResult>> {
  const parsed = createOrderSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }
  const { productId, targetId, zoneId } = parsed.data
  const cleanZone = zoneId && zoneId.length > 0 ? zoneId : null

  let product: ProductRow | null = null
  try {
    const rows = await query<ProductRow[]>(
      `SELECT id, sku, name, category, base_price, buyer_sku_code,
              needs_zone, is_active
         FROM products
        WHERE id = ?
        LIMIT 1`,
      [productId],
    )
    product = (rows?.[0] as ProductRow | undefined) ?? null
  } catch (err) {
    console.error('createOrder product lookup failed', err)
    return {
      success: false,
      error: 'Gagal memuat produk. Coba beberapa saat lagi.',
    }
  }

  if (!product || !product.is_active) {
    return { success: false, error: 'Produk tidak tersedia' }
  }

  const { sellPrice, margin } = await resolvePrice(
    product.id,
    product.category,
    Number(product.base_price),
  )
  const invoiceCode = generateInvoiceCode()

  try {
    await query(
      `INSERT INTO orders
         (invoice_code, product_id, product_name_snapshot, target_id, zone_id,
          base_price_snapshot, sell_price_snapshot, profit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceCode,
        product.id,
        product.name,
        targetId,
        cleanZone,
        Number(product.base_price),
        sellPrice,
        margin,
      ],
    )

    let snapToken: string | null = null
    let redirectUrl: string | null = null
    let mock = false
    try {
      const snap = await createSnapTransaction({
        invoiceCode,
        grossAmount: sellPrice,
        itemName: product.name,
      })
      snapToken = snap.token
      redirectUrl = snap.redirect_url
    } catch (err) {
      console.error('Midtrans Snap unavailable, returning mock order', err)
      mock = true
    }

    return {
      success: true,
      data: {
        invoiceCode,
        snapToken,
        redirectUrl,
        sellPrice,
        mock,
      },
    }
  } catch (err) {
    console.error('createOrder insert failed', err)
    return {
      success: false,
      error: 'Gagal membuat pesanan. Coba beberapa saat lagi.',
    }
  }
}

/**
 * Public order lookup by invoice code. Used by /invoice/[code] and /lacak.
 * Returns null when the order does not exist (caller falls back to mock).
 */
export async function getOrderByInvoiceCode(
  code: string,
): Promise<OrderRow | null> {
  if (!/^INV-\d{8}-[A-Z0-9]{4}$/.test(code)) return null
  try {
    const rows = await query<OrderRow[]>(
      `SELECT id, invoice_code, product_id, product_name_snapshot, target_id,
              zone_id, base_price_snapshot, sell_price_snapshot, profit,
              payment_status, fulfillment_status, sn, midtrans_order_id,
              created_at
         FROM orders
        WHERE invoice_code = ?
        LIMIT 1`,
      [code],
    )
    return (rows?.[0] as OrderRow | undefined) ?? null
  } catch (err) {
    console.error('getOrderByInvoiceCode failed', err)
    return null
  }
}
