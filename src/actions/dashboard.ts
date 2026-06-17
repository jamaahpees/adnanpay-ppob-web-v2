'use server'

import { query } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import type { ApiResponse } from './orders'

interface MetricRow {
  total: string | number
}

interface DailyCount {
  day: string
  count: number
}

export interface DashboardMetrics {
  digiflazzBalance: number
  transactionsToday: number
  grossRevenue: number
  transactions7Days: DailyCount[]
}

interface OrderRow {
  id: number
  invoice_code: string
  product_name_snapshot: string
  target_id: string
  zone_id: string | null
  base_price_snapshot: number
  sell_price_snapshot: number
  profit: number
  payment_status: string
  fulfillment_status: string
  created_at: string
}

export interface AdminOrder {
  id: number
  date: string
  invoice: string
  item: string
  target: string
  basePrice: number
  sellPrice: number
  profit: number
  paymentStatus: 'success' | 'pending' | 'failed'
  fulfillmentStatus: 'success' | 'processing' | 'failed'
}

function mapPaymentStatus(raw: string): 'success' | 'pending' | 'failed' {
  if (raw === 'success') return 'success'
  if (raw === 'pending' || raw === 'expired') return 'pending'
  return 'failed'
}

function mapFulfillmentStatus(raw: string): 'success' | 'processing' | 'failed' {
  if (raw === 'success') return 'success'
  if (raw === 'failed') return 'failed'
  return 'processing'
}

/**
 * Get dashboard metrics — requires admin auth
 */
export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const today = new Date().toISOString().split('T')[0]

  try {
    // Transactions today
    const todayCount = await query<MetricRow[]>(
      `SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = ?`,
      [today]
    )

    // Gross revenue today
    const todayRevenue = await query<MetricRow[]>(
      `SELECT COALESCE(SUM(sell_price_snapshot), 0) as total FROM orders WHERE DATE(created_at) = ? AND payment_status = 'success'`,
      [today]
    )

    // Last 7 days transaction counts
    const last7Days = await query<DailyCount[]>(
      `SELECT DATE(created_at) as day, COUNT(*) as count
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day`
    )

    // Fill missing days with zeros
    const daysMap = new Map(last7Days.map(d => [d.day, d.count]))
    const transactions7Days: DailyCount[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' })
      transactions7Days.push({
        day: dayLabel,
        count: daysMap.get(dayStr) || 0,
      })
    }

    // Digiflazz balance - use a config value or mock for now
    // In production, fetch from Digiflazz API
    const digiflazzBalance = 1250000 // Placeholder

    return {
      success: true,
      data: {
        digiflazzBalance,
        transactionsToday: Number(todayCount[0]?.total || 0),
        grossRevenue: Number(todayRevenue[0]?.total || 0),
        transactions7Days,
      },
    }
  } catch (err) {
    console.error('getDashboardMetrics failed', err)
    return { success: false, error: 'Failed to load metrics' }
  }
}

/**
 * Get orders for admin Transaksi page
 */
export async function getAdminOrders(
  limit = 50,
  offset = 0
): Promise<ApiResponse<AdminOrder[]>> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const rows = await query<OrderRow[]>(
      `SELECT id, invoice_code, product_name_snapshot, target_id,
              base_price_snapshot, sell_price_snapshot, profit,
              payment_status, fulfillment_status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    const orders: AdminOrder[] = rows.map((r) => ({
      id: r.id,
      date: r.created_at.split(' ')[0],
      invoice: r.invoice_code,
      item: r.product_name_snapshot,
      target: r.zone_id ? `${r.target_id} (${r.zone_id})` : r.target_id,
      basePrice: Number(r.base_price_snapshot),
      sellPrice: Number(r.sell_price_snapshot),
      profit: Number(r.profit),
      paymentStatus: mapPaymentStatus(r.payment_status),
      fulfillmentStatus: mapFulfillmentStatus(r.fulfillment_status),
    }))

    return { success: true, data: orders }
  } catch (err) {
    console.error('getAdminOrders failed', err)
    return { success: false, error: 'Failed to load orders' }
  }
}