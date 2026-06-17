// Static mock data for admin UI (Task #3).
// Real data sources land in Task #4 (MySQL + Server Actions).

export type ProductCategory = 'Pulsa' | 'Data' | 'Game'
export type MarginType = 'fixed' | 'percentage'
export type PricingScope = 'category' | 'sku'
export type PaymentStatus = 'success' | 'pending' | 'failed'
export type FulfillmentStatus = 'success' | 'pending' | 'failed'

export interface AdminProduct {
  sku: string
  name: string
  category: ProductCategory
  basePrice: number
  isActive: boolean
}

export interface PricingRule {
  id: string
  scope: PricingScope
  target: string
  basePriceAvg: number
  marginType: MarginType
  marginValue: number
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
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
}

export const dashboardMetrics = {
  digiflazzBalance: 1_250_000,
  transactionsToday: 47,
  grossRevenue: 2_850_000,
}

export const transactions7Days: { day: string; count: number }[] = [
  { day: 'Sen', count: 32 },
  { day: 'Sel', count: 45 },
  { day: 'Rab', count: 28 },
  { day: 'Kam', count: 61 },
  { day: 'Jum', count: 73 },
  { day: 'Sab', count: 54 },
  { day: 'Min', count: 47 },
]

export const products: AdminProduct[] = [
  { sku: 'TEL10', name: 'Telkomsel 10.000', category: 'Pulsa', basePrice: 10_000, isActive: true },
  { sku: 'TEL25', name: 'Telkomsel 25.000', category: 'Pulsa', basePrice: 25_000, isActive: true },
  { sku: 'XL5', name: 'XL 5.000', category: 'Pulsa', basePrice: 5_000, isActive: false },
  { sku: 'IND20', name: 'Indosat 20.000', category: 'Pulsa', basePrice: 20_000, isActive: true },
  { sku: 'TRI15', name: 'Tri 15.000', category: 'Pulsa', basePrice: 15_000, isActive: true },
  { sku: 'AXD5', name: 'Axis Data 5GB', category: 'Data', basePrice: 35_000, isActive: true },
  { sku: 'TSN10', name: 'Telkomsel Data 10GB', category: 'Data', basePrice: 65_000, isActive: true },
  { sku: 'XLG8', name: 'XL Data 8GB', category: 'Data', basePrice: 55_000, isActive: false },
  { sku: 'INDG12', name: 'Indosat Data 12GB', category: 'Data', basePrice: 78_000, isActive: true },
  { sku: 'ML50', name: 'Mobile Legends 50 Diamond', category: 'Game', basePrice: 12_500, isActive: true },
  { sku: 'ML172', name: 'Mobile Legends 172 Diamond', category: 'Game', basePrice: 42_000, isActive: true },
  { sku: 'FF70', name: 'Free Fire 70 Diamond', category: 'Game', basePrice: 10_000, isActive: true },
  { sku: 'GNS460', name: 'Genshin 460 Crystal', category: 'Game', basePrice: 105_000, isActive: false },
  { sku: 'VAL135', name: 'Valorant 135 Point', category: 'Game', basePrice: 18_500, isActive: true },
]

export const pricingRules: PricingRule[] = [
  { id: 'pr-1', scope: 'category', target: 'Pulsa', basePriceAvg: 15_000, marginType: 'percentage', marginValue: 10 },
  { id: 'pr-2', scope: 'category', target: 'Data', basePriceAvg: 60_000, marginType: 'percentage', marginValue: 8 },
  { id: 'pr-3', scope: 'category', target: 'Game', basePriceAvg: 35_000, marginType: 'percentage', marginValue: 12 },
  { id: 'pr-4', scope: 'sku', target: 'TEL10', basePriceAvg: 10_000, marginType: 'fixed', marginValue: 1_000 },
  { id: 'pr-5', scope: 'sku', target: 'ML50', basePriceAvg: 12_500, marginType: 'fixed', marginValue: 1_500 },
  { id: 'pr-6', scope: 'sku', target: 'TSN10', basePriceAvg: 65_000, marginType: 'percentage', marginValue: 5 },
]

export const orders: AdminOrder[] = [
  { id: 1, date: '2024-06-15', invoice: 'INV-20240615-A1B2', item: 'Telkomsel 10.000', target: '0812xxxx1234', basePrice: 10_000, sellPrice: 11_000, profit: 1_000, paymentStatus: 'success', fulfillmentStatus: 'success' },
  { id: 2, date: '2024-06-15', invoice: 'INV-20240615-C3D4', item: 'Mobile Legends 50 Diamond', target: '123456789 (2001)', basePrice: 12_500, sellPrice: 14_000, profit: 1_500, paymentStatus: 'success', fulfillmentStatus: 'success' },
  { id: 3, date: '2024-06-14', invoice: 'INV-20240614-E5F6', item: 'Telkomsel Data 10GB', target: '0813xxxx5678', basePrice: 65_000, sellPrice: 70_200, profit: 5_200, paymentStatus: 'success', fulfillmentStatus: 'pending' },
  { id: 4, date: '2024-06-14', invoice: 'INV-20240614-G7H8', item: 'XL 5.000', target: '0852xxxx9012', basePrice: 5_000, sellPrice: 5_700, profit: 700, paymentStatus: 'pending', fulfillmentStatus: 'pending' },
  { id: 5, date: '2024-06-13', invoice: 'INV-20240613-I9J0', item: 'Free Fire 70 Diamond', target: '987654321', basePrice: 10_000, sellPrice: 11_500, profit: 1_500, paymentStatus: 'success', fulfillmentStatus: 'success' },
  { id: 6, date: '2024-06-13', invoice: 'INV-20240613-K1L2', item: 'Indosat 20.000', target: '0856xxxx3456', basePrice: 20_000, sellPrice: 22_000, profit: 2_000, paymentStatus: 'failed', fulfillmentStatus: 'failed' },
  { id: 7, date: '2024-06-12', invoice: 'INV-20240612-M3N4', item: 'Genshin 460 Crystal', target: '600000123', basePrice: 105_000, sellPrice: 117_600, profit: 12_600, paymentStatus: 'success', fulfillmentStatus: 'success' },
  { id: 8, date: '2024-06-12', invoice: 'INV-20240612-O5P6', item: 'Tri 15.000', target: '0896xxxx7890', basePrice: 15_000, sellPrice: 16_500, profit: 1_500, paymentStatus: 'success', fulfillmentStatus: 'success' },
  { id: 9, date: '2024-06-11', invoice: 'INV-20240611-Q7R8', item: 'Mobile Legends 172 Diamond', target: '123456789 (2001)', basePrice: 42_000, sellPrice: 47_040, profit: 5_040, paymentStatus: 'success', fulfillmentStatus: 'pending' },
  { id: 10, date: '2024-06-11', invoice: 'INV-20240611-S9T0', item: 'Indosat Data 12GB', target: '0857xxxx2345', basePrice: 78_000, sellPrice: 84_240, profit: 6_240, paymentStatus: 'pending', fulfillmentStatus: 'pending' },
  { id: 11, date: '2024-06-10', invoice: 'INV-20240610-U1V2', item: 'Telkomsel 25.000', target: '0811xxxx6789', basePrice: 25_000, sellPrice: 27_500, profit: 2_500, paymentStatus: 'success', fulfillmentStatus: 'success' },
  { id: 12, date: '2024-06-10', invoice: 'INV-20240610-W3X4', item: 'Valorant 135 Point', target: 'AdnanGamer#123', basePrice: 18_500, sellPrice: 20_720, profit: 2_220, paymentStatus: 'failed', fulfillmentStatus: 'failed' },
]

// Final price calculation used by Pricing page. Pure function so the same
// formula is applied on every keystroke of the margin input.
export function computeFinalPrice(
  basePrice: number,
  marginType: MarginType,
  marginValue: number,
): number {
  if (marginType === 'fixed') {
    return basePrice + marginValue
  }
  // percentage
  return Math.round(basePrice * (1 + marginValue / 100))
}
