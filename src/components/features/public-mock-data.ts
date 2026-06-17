/**
 * Mock data for the public catalog & checkout flow.
 * Will be replaced by Digiflazz-synced DB rows in task #4 (server actions).
 */

export type ProductCategory = 'Pulsa' | 'Data' | 'Game'

export interface PulsaProduct {
  id: string
  name: string
  category: Extract<ProductCategory, 'Pulsa' | 'Data'>
  price: number
  sku: string
  brand: string
  /** Tailwind gradient classes for the brand tile */
  gradient: string
}

export interface GameProduct {
  id: string
  name: string
  category: Extract<ProductCategory, 'Game'>
  price: number
  sku: string
  brand: string
  gradient: string
  needsZone: boolean
}

export const pulsaProducts: PulsaProduct[] = [
  { id: 'p1',  name: 'Telkomsel 10.000',  category: 'Pulsa', price: 11000,  sku: 'TEL10',  brand: 'TSEL', gradient: 'from-red-500 to-rose-600' },
  { id: 'p2',  name: 'Telkomsel 50.000',  category: 'Pulsa', price: 50500,  sku: 'TEL50',  brand: 'TSEL', gradient: 'from-red-500 to-rose-600' },
  { id: 'p3',  name: 'XL 20.000',         category: 'Pulsa', price: 21000,  sku: 'XL20',   brand: 'XL',   gradient: 'from-blue-600 to-indigo-700' },
  { id: 'p4',  name: 'XL 100.000',        category: 'Pulsa', price: 100500, sku: 'XL100',  brand: 'XL',   gradient: 'from-blue-600 to-indigo-700' },
  { id: 'p5',  name: 'Indosat 25.000',    category: 'Pulsa', price: 25500,  sku: 'ISAT25', brand: 'ISAT', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'p6',  name: 'Tri 50.000',        category: 'Pulsa', price: 50500,  sku: 'TRI50',  brand: 'TRI',  gradient: 'from-orange-500 to-red-500' },
  { id: 'p7',  name: 'Axis 10.000',       category: 'Pulsa', price: 11000,  sku: 'AX10',   brand: 'AXIS', gradient: 'from-purple-600 to-fuchsia-600' },
  { id: 'p8',  name: 'Smartfren 20.000',  category: 'Pulsa', price: 20500,  sku: 'SF20',   brand: 'SF',   gradient: 'from-rose-500 to-pink-600' },
  { id: 'p9',  name: 'Telkomsel Data 4GB',  category: 'Data', price: 40000,  sku: 'TSEL4GB',  brand: 'TSEL', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'p10', name: 'XL Data 8GB',         category: 'Data', price: 65000,  sku: 'XL8GB',   brand: 'XL',   gradient: 'from-cyan-500 to-blue-600' },
  { id: 'p11', name: 'Indosat Data 10GB',   category: 'Data', price: 75000,  sku: 'ISAT10GB',brand: 'ISAT', gradient: 'from-lime-500 to-green-600' },
  { id: 'p12', name: 'Tri Data AON 12GB',   category: 'Data', price: 82000,  sku: 'TRI12GB', brand: 'TRI',  gradient: 'from-amber-500 to-orange-600' },
]

export const gameProducts: GameProduct[] = [
  { id: 'g1', name: 'Mobile Legends 86 Diamond',   category: 'Game', price: 24000,  sku: 'ML86',    brand: 'ML',   gradient: 'from-sky-500 to-blue-700',     needsZone: true  },
  { id: 'g2', name: 'Mobile Legends 172 Diamond',  category: 'Game', price: 47500,  sku: 'ML172',   brand: 'ML',   gradient: 'from-sky-500 to-blue-700',     needsZone: true  },
  { id: 'g3', name: 'Free Fire 70 Diamond',        category: 'Game', price: 10000,  sku: 'FF70',    brand: 'FF',   gradient: 'from-orange-500 to-red-600',   needsZone: false },
  { id: 'g4', name: 'Free Fire 355 Diamond',       category: 'Game', price: 49000,  sku: 'FF355',   brand: 'FF',   gradient: 'from-orange-500 to-red-600',   needsZone: false },
  { id: 'g5', name: 'Genshin Impact 60 Crystal',   category: 'Game', price: 16000,  sku: 'GI60',    brand: 'GI',   gradient: 'from-violet-500 to-purple-700',needsZone: false },
  { id: 'g6', name: 'Genshin Impact 330 Crystal',  category: 'Game', price: 85000,  sku: 'GI330',   brand: 'GI',   gradient: 'from-violet-500 to-purple-700',needsZone: false },
  { id: 'g7', name: 'PUBG Mobile 60 UC',           category: 'Game', price: 14500,  sku: 'PUBG60',  brand: 'PUBG', gradient: 'from-amber-600 to-yellow-700', needsZone: false },
  { id: 'g8', name: 'PUBG Mobile 325 UC',          category: 'Game', price: 78000,  sku: 'PUBG325', brand: 'PUBG', gradient: 'from-amber-600 to-yellow-700', needsZone: false },
  { id: 'g9', name: 'Valorant 125 VP',             category: 'Game', price: 32000,  sku: 'VAL125',  brand: 'VAL',  gradient: 'from-rose-500 to-red-700',     needsZone: false },
  { id: 'g10',name: 'Honkai SR 60 Oneiric',        category: 'Game', price: 16000,  sku: 'HSR60',   brand: 'HSR',  gradient: 'from-fuchsia-500 to-pink-700', needsZone: false },
]

export interface PaymentMethod {
  id: string
  name: string
  desc: string
  /** lucide icon name key resolved by renderer */
  icon: 'qr' | 'wallet' | 'bank'
  fee: number
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'qris',  name: 'QRIS',        desc: 'Scan dari e-wallet apa saja', icon: 'qr',     fee: 0.7 / 100 },
  { id: 'gopay', name: 'GoPay',       desc: 'Bayar langsung dengan GoPay', icon: 'wallet', fee: 2.0 / 100 },
  { id: 'dana',  name: 'DANA',        desc: 'Bayar langsung dengan DANA',  icon: 'wallet', fee: 1.5 / 100 },
  { id: 'ovo',   name: 'OVO',         desc: 'Bayar langsung dengan OVO',   icon: 'wallet', fee: 1.5 / 100 },
  { id: 'bca',   name: 'Bank BCA',    desc: 'Virtual Account (otomatis)',  icon: 'bank',   fee: 4000 },
]

/** Mock invoice result used by /lacak and /invoice/[code]. */
export interface InvoiceMock {
  code: string
  dateIso: string
  item: string
  targetId: string
  price: number
  payStatus: 'Berhasil' | 'Pending' | 'Gagal' | 'Diproses'
  fulfillmentStatus: 'Sukses' | 'Proses' | 'Gagal'
  sn: string
}

export function getMockInvoice(code: string): InvoiceMock {
  // Deterministic mock derived from the code so the same code yields the same receipt.
  const seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const items = [
    'Telkomsel 50.000',
    'XL Data 8GB',
    'Mobile Legends 86 Diamond',
    'Free Fire 70 Diamond',
    'Genshin Impact 60 Crystal',
  ]
  const prices = [50500, 65000, 24000, 10000, 16000]
  const idx = seed % items.length
  const dateIso = new Date(Date.now() - (seed % 72) * 3600_000).toISOString()
  return {
    code,
    dateIso,
    item: items[idx],
    targetId: `08${(seed % 9 + 1)}${((seed * 7) % 90000000 + 10000000).toString().slice(0, 9)}`,
    price: prices[idx],
    payStatus: 'Berhasil',
    fulfillmentStatus: 'Sukses',
    sn: `SN-${seed.toString(36).toUpperCase().padStart(5, '0')}-${(seed * 13).toString(36).toUpperCase().slice(0, 5)}`,
  }
}
