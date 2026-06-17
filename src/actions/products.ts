'use server'

import { z } from 'zod'

import { query } from '@/lib/db'
import { getPriceList } from '@/lib/digiflazz'
import type { ProductCategory } from '@/lib/pricing'
import { getCurrentAdmin } from '@/lib/auth'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PublicProduct {
  id: number
  sku: string
  name: string
  category: ProductCategory
  basePrice: number
  buyerSkuCode: string | null
  needsZone: boolean
  isActive: boolean
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

function mapCategory(raw: string): ProductCategory {
  const lower = (raw || '').toLowerCase()
  if (lower.includes('game')) return 'Game'
  if (lower.includes('data')) return 'Data'
  return 'Pulsa'
}

/**
 * List all active products for the public catalog.
 * Returns empty array if DB is unavailable — callers can fall back to mock.
 */
export async function listPublicProducts(): Promise<PublicProduct[]> {
  try {
    const rows = await query<ProductRow[]>(
      `SELECT id, sku, name, category, base_price, buyer_sku_code,
              needs_zone, is_active
         FROM products
        WHERE is_active = 1
        ORDER BY category, name`,
    )
    if (!rows) return []
    return rows.map((r) => ({
      id: r.id,
      sku: r.sku,
      name: r.name,
      category: r.category,
      basePrice: Number(r.base_price),
      buyerSkuCode: r.buyer_sku_code,
      needsZone: !!r.needs_zone,
      isActive: !!r.is_active,
    }))
  } catch (err) {
    console.error('listPublicProducts failed', err)
    return []
  }
}

export interface SyncResult {
  inserted: number
  updated: number
  total: number
  mock: boolean
}

/**
 * Pull the Digiflazz price-list and upsert into the products table.
 * Requires admin session. When Digiflazz creds are missing, returns a
 * mock success so the admin UI doesn't hard-fail during development.
 */
export async function syncDigiflazzAction(): Promise<ApiResponse<SyncResult>> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  let priceList
  try {
    priceList = await getPriceList()
  } catch (err) {
    console.error('syncDigiflazzAction price-list failed', err)
    return {
      success: false,
      error: 'Digiflazz belum dikonfigurasi (cek DIGIFLAZZ_USERNAME / API_KEY)',
    }
  }

  let inserted = 0
  let updated = 0

  try {
    for (const item of priceList) {
      if (!item.buyer_sku_code || !item.product_name) continue
      const category = mapCategory(item.category)
      const result = await query<{ affectedRows: number; insertId: number }>(
        `INSERT INTO products
           (sku, name, category, base_price, buyer_sku_code, needs_zone,
            is_active, digiflazz_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            category = VALUES(category),
            base_price = VALUES(base_price),
            buyer_sku_code = VALUES(buyer_sku_code),
            digiflazz_data = VALUES(digiflazz_data),
            updated = CURRENT_TIMESTAMP`,
        [
          item.buyer_sku_code,
          item.product_name,
          category,
          Math.max(0, Math.round(Number(item.buyer_price) || 0)),
          item.buyer_sku_code,
          false,
          item.buyer_sku_status !== false,
          JSON.stringify(item),
        ],
      )
      if (result && 'insertId' in result && (result as { insertId: number }).insertId > 0) {
        inserted++
      } else {
        updated++
      }
    }
  } catch (err) {
    console.error('syncDigiflazzAction upsert failed', err)
    return {
      success: false,
      error: 'Gagal menyimpan price-list ke database',
    }
  }

  return {
    success: true,
    data: {
      inserted,
      updated,
      total: inserted + updated,
      mock: false,
    },
  }
}

const toggleSchema = z.object({
  productId: z.number().int().positive(),
  isActive: z.boolean(),
})

export async function toggleProductAction(
  input: z.infer<typeof toggleSchema>,
): Promise<ApiResponse<{ productId: number; isActive: boolean }>> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }
  const parsed = toggleSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Input tidak valid' }
  }
  try {
    await query(
      'UPDATE products SET is_active = ? WHERE id = ?',
      [parsed.data.isActive ? 1 : 0, parsed.data.productId],
    )
  } catch (err) {
    console.error('toggleProductAction failed', err)
    return { success: false, error: 'Gagal memperbarui produk' }
  }
  return {
    success: true,
    data: {
      productId: parsed.data.productId,
      isActive: parsed.data.isActive,
    },
  }
}
