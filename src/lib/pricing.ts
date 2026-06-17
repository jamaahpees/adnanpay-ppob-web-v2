import { query } from '@/lib/db'

export type MarginType = 'fixed' | 'percentage'
export type ProductCategory = 'Pulsa' | 'Data' | 'Game'

export interface PricingRule {
  marginType: MarginType
  marginValue: number
}

export interface ResolvedPrice {
  sellPrice: number
  margin: number
  rule: PricingRule | null
}

/**
 * Compute the final sell price given a base price and a margin rule.
 * Pure function — identical formula shared by admin pricing page preview
 * and server-side order creation. Never trust client-provided pricing.
 */
export function computeFinalPrice(
  basePrice: number,
  marginType: MarginType,
  marginValue: number,
): number {
  if (marginType === 'fixed') {
    return basePrice + marginValue
  }
  return Math.round(basePrice * (1 + marginValue / 100))
}

interface PricingRuleRow {
  margin_type: MarginType
  margin_value: string
  product_id: number | null
  category: ProductCategory | null
}

/**
 * Resolve the effective pricing rule for a product.
 * Priority: SKU-specific (product_id) > category-level > null (no markup).
 */
export async function resolvePrice(
  productId: number,
  category: ProductCategory,
  basePrice: number,
): Promise<ResolvedPrice> {
  try {
    const rows = await query<PricingRuleRow[]>(
      `SELECT margin_type, margin_value, product_id, category
       FROM pricing_rules
       WHERE product_id = ? OR category = ?
       ORDER BY (product_id IS NOT NULL) DESC, created_at DESC
       LIMIT 1`,
      [productId, category],
    )

    if (!rows || rows.length === 0) {
      return { sellPrice: basePrice, margin: 0, rule: null }
    }

    const row = rows[0]
    const marginValue = Number(row.margin_value)
    const rule: PricingRule = {
      marginType: row.margin_type,
      marginValue,
    }
    const sellPrice = computeFinalPrice(basePrice, rule.marginType, rule.marginValue)
    return {
      sellPrice,
      margin: sellPrice - basePrice,
      rule,
    }
  } catch (err) {
    // Defensive: if DB unreachable, fall back to base price (no markup).
    console.error('resolvePrice failed, using base price', err)
    return { sellPrice: basePrice, margin: 0, rule: null }
  }
}
