'use server'

import { z } from 'zod'

import { query } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import type { MarginType, ProductCategory } from '@/lib/pricing'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PricingRuleInput {
  productId?: number | null
  category?: ProductCategory | null
  marginType: MarginType
  marginValue: number
}

const ruleSchema = z.object({
  productId: z.number().int().positive().nullable().optional(),
  category: z.enum(['Pulsa', 'Data', 'Game']).nullable().optional(),
  marginType: z.enum(['fixed', 'percentage']),
  marginValue: z.number().min(0),
})

const saveSchema = z.array(ruleSchema)

export interface SavePricingResult {
  saved: number
}

/**
 * Replace all pricing_rules with the provided set. Requires admin.
 * Existing rules are deleted then inserted in a single transaction.
 */
export async function savePricingRulesAction(
  input: PricingRuleInput[],
): Promise<ApiResponse<SavePricingResult>> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }

  try {
    const pool = (await import('@/lib/db')).getPool()
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      await conn.query('DELETE FROM pricing_rules')
      for (const rule of parsed.data) {
        if (rule.productId == null && rule.category == null) continue
        await conn.query(
          `INSERT INTO pricing_rules
             (product_id, category, margin_type, margin_value)
           VALUES (?, ?, ?, ?)`,
          [
            rule.productId ?? null,
            rule.category ?? null,
            rule.marginType,
            rule.marginValue,
          ],
        )
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('savePricingRulesAction failed', err)
    return {
      success: false,
      error: 'Gagal menyimpan aturan pricing',
    }
  }

  return {
    success: true,
    data: { saved: parsed.data.length },
  }
}

interface PricingRuleRow {
  id: number
  product_id: number | null
  category: ProductCategory | null
  margin_type: MarginType
  margin_value: string
}

export interface PersistedPricingRule {
  id: number
  productId: number | null
  category: ProductCategory | null
  marginType: MarginType
  marginValue: number
}

/**
 * Load all persisted pricing rules for admin UI hydration.
 */
export async function listPricingRules(): Promise<PersistedPricingRule[]> {
  try {
    const rows = await query<PricingRuleRow[]>(
      `SELECT id, product_id, category, margin_type, margin_value
         FROM pricing_rules
        ORDER BY (product_id IS NULL), category, id`,
    )
    if (!rows) return []
    return rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      category: r.category,
      marginType: r.margin_type,
      marginValue: Number(r.margin_value),
    }))
  } catch (err) {
    console.error('listPricingRules failed', err)
    return []
  }
}
