/**
 * Catalog data following Digiflazz category structure.
 * Structure: Category → Brand → Denominations
 * Source categories: https://id.digiflazz.com/daftar-harga
 * Categories: Pulsa, Paket Data, Voucher Game, Saldo E-Money, Token PLN, Streaming
 */

export type CategoryId = 'pulsa' | 'data' | 'game' | 'emoney' | 'pln' | 'streaming'

export interface Category {
  id: CategoryId
  name: string
  /** Lucide icon name for the category tile */
  icon: string
  /** Emoji fallback */
  emoji: string
  gradient: string
  /** Input label for target ID */
  inputLabel: string
  /** Input placeholder */
  inputPlaceholder: string
  /** Whether this category needs Zone ID (ML-style) */
  needsZone?: boolean
}

export const categories: Category[] = [
  {
    id: 'pulsa',
    name: 'Pulsa',
    icon: 'Smartphone',
    emoji: '📱',
    gradient: 'from-blue-500 to-indigo-600',
    inputLabel: 'Nomor HP',
    inputPlaceholder: '08xxxxxxxxxx',
  },
  {
    id: 'data',
    name: 'Paket Data',
    icon: 'Wifi',
    emoji: '📶',
    gradient: 'from-emerald-500 to-teal-600',
    inputLabel: 'Nomor HP',
    inputPlaceholder: '08xxxxxxxxxx',
  },
  {
    id: 'game',
    name: 'Voucher Game',
    icon: 'Gamepad2',
    emoji: '🎮',
    gradient: 'from-violet-500 to-purple-700',
    inputLabel: 'User ID',
    inputPlaceholder: 'Masukkan User ID',
    needsZone: true,
  },
  {
    id: 'emoney',
    name: 'Saldo E-Money',
    icon: 'Wallet',
    emoji: '💳',
    gradient: 'from-amber-500 to-orange-600',
    inputLabel: 'Nomor HP / ID',
    inputPlaceholder: '08xxxxxxxxxx',
  },
  {
    id: 'pln',
    name: 'Token PLN',
    icon: 'Zap',
    emoji: '⚡',
    gradient: 'from-yellow-400 to-amber-500',
    inputLabel: 'ID Pelanggan',
    inputPlaceholder: 'Masukkan ID Pelanggan PLN',
  },
  {
    id: 'streaming',
    name: 'Streaming',
    icon: 'PlayCircle',
    emoji: '🎬',
    gradient: 'from-rose-500 to-red-600',
    inputLabel: 'Email / ID',
    inputPlaceholder: 'Masukkan Email atau ID',
  },
]

export interface Denomination {
  id: string
  name: string
  label: string
  price: number
  sku: string
  needsZone?: boolean
  /** Bulk discount tiers (qty → price multiplier), optional */
  bulkTiers?: { qty: number; multiplier: number }[]
}

export interface Brand {
  id: string
  name: string
  slug: string
  category: CategoryId
  gradient: string
  emoji: string
  /** Image asset path (public assets or external URL) */
  image?: string
  needsZone?: boolean
  denominations: Denomination[]
}

// ── PULSA (Telkomsel, XL, Indosat, Tri, Axis, Smartfren) ──
const pulsaBrands: Brand[] = [
  {
    id: 'tsel', name: 'Telkomsel', slug: 'telkomsel', category: 'pulsa',
    gradient: 'from-red-500 to-rose-600', emoji: '🔴',
    image: '/brands/telkomsel.png',
    denominations: [
      { id: 't5', name: 'Pulsa 5.000', label: '5.000', price: 6000, sku: 'TSEL5' },
      { id: 't10', name: 'Pulsa 10.000', label: '10.000', price: 11000, sku: 'TSEL10' },
      { id: 't20', name: 'Pulsa 20.000', label: '20.000', price: 21000, sku: 'TSEL20' },
      { id: 't25', name: 'Pulsa 25.000', label: '25.000', price: 26000, sku: 'TSEL25' },
      { id: 't50', name: 'Pulsa 50.000', label: '50.000', price: 50500, sku: 'TSEL50' },
      { id: 't100', name: 'Pulsa 100.000', label: '100.000', price: 100500, sku: 'TSEL100' },
      { id: 't300', name: 'Pulsa 300.000', label: '300.000', price: 299000, sku: 'TSEL300' },
      { id: 't500', name: 'Pulsa 500.000', label: '500.000', price: 499000, sku: 'TSEL500' },
    ],
  },
  {
    id: 'xl', name: 'XL', slug: 'xl', category: 'pulsa',
    gradient: 'from-blue-600 to-indigo-700', emoji: '🔵',
    image: '/brands/xl.png',
    denominations: [
      { id: 'x5', name: 'Pulsa 5.000', label: '5.000', price: 6000, sku: 'XL5' },
      { id: 'x10', name: 'Pulsa 10.000', label: '10.000', price: 11000, sku: 'XL10' },
      { id: 'x25', name: 'Pulsa 25.000', label: '25.000', price: 26000, sku: 'XL25' },
      { id: 'x50', name: 'Pulsa 50.000', label: '50.000', price: 50500, sku: 'XL50' },
      { id: 'x100', name: 'Pulsa 100.000', label: '100.000', price: 100500, sku: 'XL100' },
    ],
  },
  {
    id: 'indosat', name: 'Indosat', slug: 'indosat', category: 'pulsa',
    gradient: 'from-yellow-500 to-amber-600', emoji: '🟡',
    image: '/brands/indosat.png',
    denominations: [
      { id: 'i5', name: 'Pulsa 5.000', label: '5.000', price: 6000, sku: 'ISAT5' },
      { id: 'i10', name: 'Pulsa 10.000', label: '10.000', price: 11000, sku: 'ISAT10' },
      { id: 'i25', name: 'Pulsa 25.000', label: '25.000', price: 26000, sku: 'ISAT25' },
      { id: 'i50', name: 'Pulsa 50.000', label: '50.000', price: 50500, sku: 'ISAT50' },
      { id: 'i100', name: 'Pulsa 100.000', label: '100.000', price: 100500, sku: 'ISAT100' },
    ],
  },
  {
    id: 'tri', name: 'Tri (3)', slug: 'tri', category: 'pulsa',
    gradient: 'from-orange-500 to-red-500', emoji: '🟠',
    image: '/brands/tri.png',
    denominations: [
      { id: 'r5', name: 'Pulsa 5.000', label: '5.000', price: 6000, sku: 'TRI5' },
      { id: 'r10', name: 'Pulsa 10.000', label: '10.000', price: 11000, sku: 'TRI10' },
      { id: 'r20', name: 'Pulsa 20.000', label: '20.000', price: 21000, sku: 'TRI20' },
      { id: 'r50', name: 'Pulsa 50.000', label: '50.000', price: 50500, sku: 'TRI50' },
      { id: 'r100', name: 'Pulsa 100.000', label: '100.000', price: 100500, sku: 'TRI100' },
    ],
  },
  {
    id: 'axis', name: 'Axis', slug: 'axis', category: 'pulsa',
    gradient: 'from-purple-600 to-fuchsia-600', emoji: '🟣',
    image: '/brands/axis.png',
    denominations: [
      { id: 'a5', name: 'Pulsa 5.000', label: '5.000', price: 6000, sku: 'AXIS5' },
      { id: 'a10', name: 'Pulsa 10.000', label: '10.000', price: 11000, sku: 'AXIS10' },
      { id: 'a20', name: 'Pulsa 20.000', label: '20.000', price: 21000, sku: 'AXIS20' },
      { id: 'a50', name: 'Pulsa 50.000', label: '50.000', price: 50500, sku: 'AXIS50' },
    ],
  },
  {
    id: 'smartfren', name: 'Smartfren', slug: 'smartfren', category: 'pulsa',
    gradient: 'from-rose-500 to-pink-600', emoji: '🌸',
    image: '/brands/smartfren.png',
    denominations: [
      { id: 'sf5', name: 'Pulsa 5.000', label: '5.000', price: 6000, sku: 'SF5' },
      { id: 'sf10', name: 'Pulsa 10.000', label: '10.000', price: 11000, sku: 'SF10' },
      { id: 'sf20', name: 'Pulsa 20.000', label: '20.000', price: 21000, sku: 'SF20' },
      { id: 'sf50', name: 'Pulsa 50.000', label: '50.000', price: 50500, sku: 'SF50' },
    ],
  },
  {
    id: 'byu', name: 'by.U', slug: 'byu', category: 'pulsa',
    gradient: 'from-cyan-500 to-blue-500', emoji: '💎',
    image: '/brands/byu.png',
    denominations: [
      { id: 'b10', name: 'Pulsa 10.000', label: '10.000', price: 11500, sku: 'BYU10' },
      { id: 'b20', name: 'Pulsa 20.000', label: '20.000', price: 21500, sku: 'BYU20' },
      { id: 'b50', name: 'Pulsa 50.000', label: '50.000', price: 51000, sku: 'BYU50' },
    ],
  },
]

// ── DATA (Paket Data per provider) ──
const dataBrands: Brand[] = [
  {
    id: 'tsel-data', name: 'Telkomsel Data', slug: 'telkomsel-data', category: 'data',
    gradient: 'from-emerald-500 to-teal-600', emoji: '📶',
    image: '/brands/telkomsel-data.png',
    denominations: [
      { id: 'td1', name: 'Data 1.5GB (7 Hari)', label: '1.5GB / 7 Hari', price: 16000, sku: 'TSEL1.5GB7' },
      { id: 'td2', name: 'Data 4GB (30 Hari)', label: '4GB / 30 Hari', price: 40000, sku: 'TSEL4GB30' },
      { id: 'td3', name: 'Data 8GB (30 Hari)', label: '8GB / 30 Hari', price: 65000, sku: 'TSEL8GB30' },
      { id: 'td4', name: 'Data 15GB (30 Hari)', label: '15GB / 30 Hari', price: 95000, sku: 'TSEL15GB30' },
      { id: 'td5', name: 'Data 25GB (30 Hari)', label: '25GB / 30 Hari', price: 135000, sku: 'TSEL25GB30' },
      { id: 'td6', name: 'Data 50GB (30 Hari)', label: '50GB / 30 Hari', price: 225000, sku: 'TSEL50GB30' },
    ],
  },
  {
    id: 'xl-data', name: 'XL Data', slug: 'xl-data', category: 'data',
    gradient: 'from-cyan-500 to-blue-600', emoji: '📶',
    image: '/brands/xl-data.png',
    denominations: [
      { id: 'xd1', name: 'Data 1GB (30 Hari)', label: '1GB / 30 Hari', price: 18000, sku: 'XL1GB30' },
      { id: 'xd2', name: 'Data 3GB (30 Hari)', label: '3GB / 30 Hari', price: 45000, sku: 'XL3GB30' },
      { id: 'xd3', name: 'Data 8GB (30 Hari)', label: '8GB / 30 Hari', price: 80000, sku: 'XL8GB30' },
      { id: 'xd4', name: 'Data 15GB (30 Hari)', label: '15GB / 30 Hari', price: 125000, sku: 'XL15GB30' },
      { id: 'xd5', name: 'Data 30GB (30 Hari)', label: '30GB / 30 Hari', price: 175000, sku: 'XL30GB30' },
    ],
  },
  {
    id: 'indosat-data', name: 'Indosat Data', slug: 'indosat-data', category: 'data',
    gradient: 'from-lime-500 to-green-600', emoji: '📶',
    image: '/brands/indosat-data.png',
    denominations: [
      { id: 'id1', name: 'Data 2GB (30 Hari)', label: '2GB / 30 Hari', price: 22000, sku: 'ISAT2GB30' },
      { id: 'id2', name: 'Data 5GB (30 Hari)', label: '5GB / 30 Hari', price: 45000, sku: 'ISAT5GB30' },
      { id: 'id3', name: 'Data 10GB (30 Hari)', label: '10GB / 30 Hari', price: 75000, sku: 'ISAT10GB30' },
      { id: 'id4', name: 'Data 25GB (30 Hari)', label: '25GB / 30 Hari', price: 135000, sku: 'ISAT25GB30' },
    ],
  },
  {
    id: 'tri-data', name: 'Tri Data', slug: 'tri-data', category: 'data',
    gradient: 'from-amber-500 to-orange-600', emoji: '📶',
    image: '/brands/tri-data.png',
    denominations: [
      { id: 'rd1', name: 'Data 2GB (30 Hari)', label: '2GB / 30 Hari', price: 20000, sku: 'TRI2GB30' },
      { id: 'rd2', name: 'Data 4GB (30 Hari)', label: '4GB / 30 Hari', price: 40000, sku: 'TRI4GB30' },
      { id: 'rd3', name: 'Data 12GB (AON)', label: '12GB / AON', price: 82000, sku: 'TRI12GBAON' },
      { id: 'rd4', name: 'Data 25GB (AON)', label: '25GB / AON', price: 155000, sku: 'TRI25GBAON' },
    ],
  },
]

// ── GAME (Voucher Game) ──
const gameBrands: Brand[] = [
  {
    id: 'ml', name: 'Mobile Legends', slug: 'mobile-legends', category: 'game',
    gradient: 'from-sky-500 to-blue-700', emoji: '⚔️',
    image: '/brands/mobile-legends.png', needsZone: true,
    denominations: [
      { id: 'ml1', name: '5 Diamond', label: '5 💎', price: 1500, sku: 'ML5', needsZone: true },
      { id: 'ml2', name: '12 Diamond', label: '12 💎', price: 3500, sku: 'ML12', needsZone: true },
      { id: 'ml3', name: '28 Diamond', label: '28 💎', price: 8000, sku: 'ML28', needsZone: true },
      { id: 'ml4', name: '44 Diamond', label: '44 💎', price: 12000, sku: 'ML44', needsZone: true },
      { id: 'ml5', name: '86 Diamond', label: '86 💎', price: 24000, sku: 'ML86', needsZone: true },
      { id: 'ml6', name: '172 Diamond', label: '172 💎', price: 47500, sku: 'ML172', needsZone: true },
      { id: 'ml7', name: '257 Diamond', label: '257 💎', price: 70000, sku: 'ML257', needsZone: true },
      { id: 'ml8', name: '344 Diamond', label: '344 💎', price: 93000, sku: 'ML344', needsZone: true },
      { id: 'ml9', name: '429 Diamond', label: '429 💎', price: 115000, sku: 'ML429', needsZone: true },
      { id: 'ml10', name: '514 Diamond', label: '514 💎', price: 138000, sku: 'ML514', needsZone: true },
      { id: 'ml11', name: '706 Diamond', label: '706 💎', price: 185000, sku: 'ML706', needsZone: true },
      { id: 'ml12', name: '878 Diamond', label: '878 💎', price: 230000, sku: 'ML878', needsZone: true },
      { id: 'ml13', name: '1412 Diamond', label: '1412 💎', price: 365000, sku: 'ML1412', needsZone: true },
      { id: 'ml14', name: '2195 Diamond', label: '2195 💎', price: 565000, sku: 'ML2195', needsZone: true },
      { id: 'ml15', name: '3688 Diamond', label: '3688 💎', price: 945000, sku: 'ML3688', needsZone: true },
      { id: 'ml16', name: 'Weekly Diamond Pass', label: 'Weekly Pass', price: 30000, sku: 'MLWEEK', needsZone: true },
      { id: 'ml17', name: 'Monthly Diamond Pass', label: 'Monthly Pass', price: 145000, sku: 'MLMONTH', needsZone: true },
      { id: 'ml18', name: 'Twilight Pass', label: 'Twilight Pass', price: 145000, sku: 'MLTWILIGHT', needsZone: true },
    ],
  },
  {
    id: 'ff', name: 'Free Fire', slug: 'free-fire', category: 'game',
    gradient: 'from-orange-500 to-red-600', emoji: '🔥',
    image: '/brands/free-fire.png',
    denominations: [
      { id: 'ff1', name: '5 Diamond', label: '5 💎', price: 1000, sku: 'FF5' },
      { id: 'ff2', name: '12 Diamond', label: '12 💎', price: 2000, sku: 'FF12' },
      { id: 'ff3', name: '50 Diamond', label: '50 💎', price: 7500, sku: 'FF50' },
      { id: 'ff4', name: '70 Diamond', label: '70 💎', price: 10000, sku: 'FF70' },
      { id: 'ff5', name: '140 Diamond', label: '140 💎', price: 20000, sku: 'FF140' },
      { id: 'ff6', name: '210 Diamond', label: '210 💎', price: 30000, sku: 'FF210' },
      { id: 'ff7', name: '355 Diamond', label: '355 💎', price: 49000, sku: 'FF355' },
      { id: 'ff8', name: '720 Diamond', label: '720 💎', price: 99000, sku: 'FF720' },
      { id: 'ff9', name: '1450 Diamond', label: '1450 💎', price: 195000, sku: 'FF1450' },
      { id: 'ff10', name: 'Weekly Membership', label: 'Weekly Member', price: 30000, sku: 'FFWEEK' },
      { id: 'ff11', name: 'Monthly Membership', label: 'Monthly Member', price: 149000, sku: 'FFMONTH' },
    ],
  },
  {
    id: 'genshin', name: 'Genshin Impact', slug: 'genshin-impact', category: 'game',
    gradient: 'from-violet-500 to-purple-700', emoji: '✨',
    image: '/brands/genshin.png',
    denominations: [
      { id: 'gi1', name: '60 Genesis Crystals', label: '60 Crystals', price: 16000, sku: 'GI60' },
      { id: 'gi2', name: '300+35 Genesis Crystals', label: '300+35', price: 79000, sku: 'GI300' },
      { id: 'gi3', name: '980+110 Genesis Crystals', label: '980+110', price: 249000, sku: 'GI980' },
      { id: 'gi4', name: '1980+260 Genesis Crystals', label: '1980+260', price: 479000, sku: 'GI1980' },
      { id: 'gi5', name: '3280+440 Genesis Crystals', label: '3280+440', price: 799000, sku: 'GI3280' },
      { id: 'gi6', name: '6480+960 Genesis Crystals', label: '6480+960', price: 1599000, sku: 'GI6480' },
      { id: 'gi7', name: 'Blessing of Welkin Moon', label: 'Welkin Moon', price: 79000, sku: 'GIWELKIN' },
    ],
  },
  {
    id: 'pubg', name: 'PUBG Mobile', slug: 'pubg-mobile', category: 'game',
    gradient: 'from-amber-600 to-yellow-700', emoji: '🎯',
    image: '/brands/pubg.png',
    denominations: [
      { id: 'pg1', name: '60 UC', label: '60 UC', price: 14500, sku: 'PUBG60' },
      { id: 'pg2', name: '150+5 UC', label: '150+5 UC', price: 33000, sku: 'PUBG150' },
      { id: 'pg3', name: '325+25 UC', label: '325+25 UC', price: 65000, sku: 'PUBG325' },
      { id: 'pg4', name: '660+60 UC', label: '660+60 UC', price: 125000, sku: 'PUBG660' },
      { id: 'pg5', name: '1800+300 UC', label: '1800+300 UC', price: 325000, sku: 'PUBG1800' },
      { id: 'pg6', name: '3850+850 UC', label: '3850+850 UC', price: 650000, sku: 'PUBG3850' },
      { id: 'pg7', name: 'Royale Pass (RP)', label: 'Royale Pass', price: 145000, sku: 'PUBGRP' },
    ],
  },
  {
    id: 'valorant', name: 'Valorant', slug: 'valorant', category: 'game',
    gradient: 'from-rose-500 to-red-700', emoji: '💥',
    image: '/brands/valorant.png',
    denominations: [
      { id: 'vl1', name: '125 VP', label: '125 VP', price: 16000, sku: 'VAL125' },
      { id: 'vl2', name: '475 VP', label: '475 VP', price: 59000, sku: 'VAL475' },
      { id: 'vl3', name: '1000 VP', label: '1000 VP', price: 119000, sku: 'VAL1000' },
      { id: 'vl4', name: '2050 VP', label: '2050 VP', price: 239000, sku: 'VAL2050' },
      { id: 'vl5', name: '5350 VP', label: '5350 VP', price: 599000, sku: 'VAL5350' },
    ],
  },
  {
    id: 'honkai', name: 'Honkai: Star Rail', slug: 'honkai-star-rail', category: 'game',
    gradient: 'from-fuchsia-500 to-pink-700', emoji: '🌟',
    image: '/brands/honkai-sr.png',
    denominations: [
      { id: 'hsr1', name: '60 Oneiric Shards', label: '60 Shards', price: 16000, sku: 'HSR60' },
      { id: 'hsr2', name: '330 Oneiric Shards', label: '330 Shards', price: 79000, sku: 'HSR330' },
      { id: 'hsr3', name: '990 Oneiric Shards', label: '990 Shards', price: 239000, sku: 'HSR990' },
      { id: 'hsr4', name: '1980 Oneiric Shards', label: '1980 Shards', price: 479000, sku: 'HSR1980' },
      { id: 'hsr5', name: '3280 Oneiric Shards', label: '3280 Shards', price: 799000, sku: 'HSR3280' },
      { id: 'hsr6', name: '6480 Oneiric Shards', label: '6480 Shards', price: 1599000, sku: 'HSR6480' },
      { id: 'hsr7', name: 'Express Supply Pass', label: 'Express Pass', price: 79000, sku: 'HSREXPR' },
    ],
  },
  {
    id: 'aov', name: 'Arena of Valor', slug: 'arena-of-valor', category: 'game',
    gradient: 'from-indigo-500 to-blue-700', emoji: '🛡️',
    image: '/brands/aov.png',
    denominations: [
      { id: 'aov1', name: '40 Voucher', label: '40 Voucher', price: 10000, sku: 'AOV40' },
      { id: 'aov2', name: '66 Voucher', label: '66 Voucher', price: 16000, sku: 'AOV66' },
      { id: 'aov3', name: '233 Voucher', label: '233 Voucher', price: 56000, sku: 'AOV233' },
      { id: 'aov4', name: '466 Voucher', label: '466 Voucher', price: 110000, sku: 'AOV466' },
    ],
  },
  {
    id: 'codm', name: 'Call of Duty Mobile', slug: 'cod-mobile', category: 'game',
    gradient: 'from-stone-600 to-stone-800', emoji: '🔫',
    image: '/brands/codm.png',
    denominations: [
      { id: 'cm1', name: '80 CP', label: '80 CP', price: 16000, sku: 'CODM80' },
      { id: 'cm2', name: '400 CP', label: '400 CP', price: 79000, sku: 'CODM400' },
      { id: 'cm3', name: '800 CP', label: '800 CP', price: 145000, sku: 'CODM800' },
      { id: 'cm4', name: '2000 CP', label: '2000 CP', price: 349000, sku: 'CODM2000' },
    ],
  },
]

// ── E-MONEY (Saldo E-Wallet) ──
const emoneyBrands: Brand[] = [
  {
    id: 'gopay', name: 'GoPay', slug: 'gopay', category: 'emoney',
    gradient: 'from-green-500 to-emerald-600', emoji: '💚',
    image: '/brands/gopay.png',
    denominations: [
      { id: 'gp20', name: 'Saldo 20.000', label: '20.000', price: 21000, sku: 'GOPAY20' },
      { id: 'gp50', name: 'Saldo 50.000', label: '50.000', price: 51000, sku: 'GOPAY50' },
      { id: 'gp100', name: 'Saldo 100.000', label: '100.000', price: 100500, sku: 'GOPAY100' },
      { id: 'gp200', name: 'Saldo 200.000', label: '200.000', price: 200000, sku: 'GOPAY200' },
      { id: 'gp500', name: 'Saldo 500.000', label: '500.000', price: 499000, sku: 'GOPAY500' },
    ],
  },
  {
    id: 'ovo', name: 'OVO', slug: 'ovo', category: 'emoney',
    gradient: 'from-purple-600 to-violet-700', emoji: '🟣',
    image: '/brands/ovo.png',
    denominations: [
      { id: 'ov20', name: 'Saldo 20.000', label: '20.000', price: 21000, sku: 'OVO20' },
      { id: 'ov50', name: 'Saldo 50.000', label: '50.000', price: 51000, sku: 'OVO50' },
      { id: 'ov100', name: 'Saldo 100.000', label: '100.000', price: 100500, sku: 'OVO100' },
      { id: 'ov300', name: 'Saldo 300.000', label: '300.000', price: 300000, sku: 'OVO300' },
    ],
  },
  {
    id: 'dana', name: 'DANA', slug: 'dana', category: 'emoney',
    gradient: 'from-blue-500 to-cyan-600', emoji: '🔵',
    image: '/brands/dana.png',
    denominations: [
      { id: 'dn20', name: 'Saldo 20.000', label: '20.000', price: 21000, sku: 'DANA20' },
      { id: 'dn50', name: 'Saldo 50.000', label: '50.000', price: 51000, sku: 'DANA50' },
      { id: 'dn100', name: 'Saldo 100.000', label: '100.000', price: 100500, sku: 'DANA100' },
      { id: 'dn500', name: 'Saldo 500.000', label: '500.000', price: 499000, sku: 'DANA500' },
    ],
  },
  {
    id: 'shopeepay', name: 'ShopeePay', slug: 'shopeepay', category: 'emoney',
    gradient: 'from-orange-500 to-red-500', emoji: '🛍️',
    image: '/brands/shopeepay.png',
    denominations: [
      { id: 'sp10', name: 'Saldo 10.000', label: '10.000', price: 11000, sku: 'SPAY10' },
      { id: 'sp50', name: 'Saldo 50.000', label: '50.000', price: 51000, sku: 'SPAY50' },
      { id: 'sp100', name: 'Saldo 100.000', label: '100.000', price: 100500, sku: 'SPAY100' },
    ],
  },
  {
    id: 'linkaja', name: 'LinkAja', slug: 'linkaja', category: 'emoney',
    gradient: 'from-red-500 to-rose-600', emoji: '🔴',
    image: '/brands/linkaja.png',
    denominations: [
      { id: 'la20', name: 'Saldo 20.000', label: '20.000', price: 21000, sku: 'LINK20' },
      { id: 'la50', name: 'Saldo 50.000', label: '50.000', price: 51000, sku: 'LINK50' },
      { id: 'la100', name: 'Saldo 100.000', label: '100.000', price: 100500, sku: 'LINK100' },
    ],
  },
]

// ── PLN (Token Listrik) ──
const plnBrands: Brand[] = [
  {
    id: 'pln', name: 'PLN Prabayar', slug: 'pln-prabayar', category: 'pln',
    gradient: 'from-yellow-400 to-amber-500', emoji: '⚡',
    image: '/brands/pln.png',
    denominations: [
      { id: 'pln20', name: 'Token 20.000', label: '20.000', price: 21000, sku: 'PLN20' },
      { id: 'pln50', name: 'Token 50.000', label: '50.000', price: 51000, sku: 'PLN50' },
      { id: 'pln100', name: 'Token 100.000', label: '100.000', price: 100500, sku: 'PLN100' },
      { id: 'pln200', name: 'Token 200.000', label: '200.000', price: 200500, sku: 'PLN200' },
      { id: 'pln500', name: 'Token 500.000', label: '500.000', price: 500500, sku: 'PLN500' },
      { id: 'pln1m', name: 'Token 1.000.000', label: '1.000.000', price: 1000500, sku: 'PLN1M' },
    ],
  },
]

// ── STREAMING ──
const streamingBrands: Brand[] = [
  {
    id: 'netflix', name: 'Netflix', slug: 'netflix', category: 'streaming',
    gradient: 'from-red-600 to-rose-700', emoji: '🎬',
    image: '/brands/netflix.png',
    denominations: [
      { id: 'nf1', name: 'Mobile (1 Bulan)', label: 'Mobile', price: 54000, sku: 'NFXM' },
      { id: 'nf2', name: 'Basic (1 Bulan)', label: 'Basic', price: 65000, sku: 'NFXB' },
      { id: 'nf3', name: 'Standard (1 Bulan)', label: 'Standard', price: 120000, sku: 'NFXS' },
      { id: 'nf4', name: 'Premium (1 Bulan)', label: 'Premium', price: 186000, sku: 'NFXP' },
    ],
  },
  {
    id: 'spotify', name: 'Spotify', slug: 'spotify', category: 'streaming',
    gradient: 'from-green-500 to-emerald-600', emoji: '🎵',
    image: '/brands/spotify.png',
    denominations: [
      { id: 'sp1', name: 'Premium Individual (1 Bulan)', label: 'Individual', price: 54900, sku: 'SPOTIND' },
      { id: 'sp2', name: 'Premium Family (1 Bulan)', label: 'Family', price: 89900, sku: 'SPOTFAM' },
      { id: 'sp3', name: 'Premium Student (1 Bulan)', label: 'Student', price: 29900, sku: 'SPOTSTU' },
    ],
  },
  {
    id: 'disney', name: 'Disney+ Hotstar', slug: 'disney-hotstar', category: 'streaming',
    gradient: 'from-blue-600 to-indigo-700', emoji: '🏰',
    image: '/brands/disney.png',
    denominations: [
      { id: 'dp1', name: 'Mobile (1 Bulan)', label: 'Mobile', price: 39000, sku: 'DPMM' },
      { id: 'dp2', name: 'Premium (1 Bulan)', label: 'Premium', price: 79000, sku: 'DPPM' },
    ],
  },
  {
    id: 'vidio', name: 'Vidio', slug: 'vidio', category: 'streaming',
    gradient: 'from-blue-500 to-sky-600', emoji: '📺',
    image: '/brands/vidio.png',
    denominations: [
      { id: 'vd1', name: 'Platinum (1 Bulan)', label: 'Platinum', price: 55000, sku: 'VIDPLAT' },
      { id: 'vd2', name: 'Platinum Annual (1 Tahun)', label: 'Platinum Annual', price: 450000, sku: 'VIDPLATYR' },
    ],
  },
]

export const allBrands: Brand[] = [
  ...pulsaBrands,
  ...dataBrands,
  ...gameBrands,
  ...emoneyBrands,
  ...plnBrands,
  ...streamingBrands,
]

export function getBrandsByCategory(category: CategoryId): Brand[] {
  return allBrands.filter((b) => b.category === category)
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return allBrands.find((b) => b.slug === slug)
}

export function getCategoryById(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id)
}

// ── Payment Methods ──────────────────────────────────────

export interface PaymentMethod {
  id: string
  name: string
  desc: string
  icon: 'qr' | 'wallet' | 'bank'
  fee: number
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'qris', name: 'QRIS', desc: 'Scan dari e-wallet apa saja', icon: 'qr', fee: 0.7 / 100 },
  { id: 'gopay', name: 'GoPay', desc: 'Bayar langsung dengan GoPay', icon: 'wallet', fee: 2.0 / 100 },
  { id: 'dana', name: 'DANA', desc: 'Bayar langsung dengan DANA', icon: 'wallet', fee: 1.5 / 100 },
  { id: 'ovo', name: 'OVO', desc: 'Bayar langsung dengan OVO', icon: 'wallet', fee: 1.5 / 100 },
  { id: 'bca', name: 'Bank BCA', desc: 'Virtual Account (otomatis)', icon: 'bank', fee: 4000 },
]

// ── Invoice Mock ─────────────────────────────────────────

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
  const seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const items = [
    'Telkomsel 10.000',
    'XL Data 3GB',
    'Mobile Legends 86 Diamond',
    'Free Fire 70 Diamond',
    'Genshin Impact 60 Genesis Crystals',
    'GoPay 50.000',
    'PLN Token 50.000',
  ]
  const prices = [11000, 45000, 24000, 10000, 16000, 51000, 51000]
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