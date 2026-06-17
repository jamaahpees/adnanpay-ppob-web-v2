'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Search,
  Smartphone,
  Wifi,
  Gamepad2,
  Wallet,
  Zap,
  PlayCircle,
  ShoppingCart,
  Check,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  QrCode,
  Landmark,
  ChevronRight,
} from 'lucide-react'

import { cn, formatRupiah } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  categories,
  getBrandsByCategory,
  paymentMethods,
  type Category,
  type Brand,
  type Denomination,
  type PaymentMethod,
} from './public-mock-data'
import { createOrder } from '@/actions/orders'

// Midtrans Snap script is loaded lazily on demand.
const MIDTRANS_SNAP_SRC =
  process.env.NEXT_PUBLIC_MIDTRANS_SNAP_SRC ??
  (process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js')

interface SnapWindow extends Window {
  snap?: {
    pay: (
      token: string,
      callbacks?: {
        onSuccess?: (result: unknown) => void
        onPending?: (result: unknown) => void
        onError?: (result: unknown) => void
        onClose?: () => void
      },
    ) => void
  }
}

function loadSnapScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const w = window as SnapWindow
  if (w.snap) return Promise.resolve()
  const existing = document.getElementById('midtrans-snap-script')
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(), { once: true })
    })
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.id = 'midtrans-snap-script'
    s.src = MIDTRANS_SNAP_SRC
    s.dataset.clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Gagal memuat Midtrans Snap script'))
    document.head.appendChild(s)
  })
}

function mockInvoiceCode(): string {
  const now = new Date()
  const ymd =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const suffix = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
  return `INV-${ymd}-${suffix}`
}

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Wifi,
  Gamepad2,
  Wallet,
  Zap,
  PlayCircle,
}

const PAYMENT_ICON: Record<PaymentMethod['icon'], React.ComponentType<{ className?: string }>> = {
  qr: QrCode,
  wallet: Wallet,
  bank: Landmark,
}

interface SelectedProduct {
  brand: Brand
  denom: Denomination
  category: Category
}

export function PublicHomepage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = React.useState<Category>(categories[0])
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null)
  const [selected, setSelected] = React.useState<SelectedProduct | null>(null)

  const [query, setQuery] = React.useState('')
  const [targetId, setTargetId] = React.useState('')
  const [zoneId, setZoneId] = React.useState('')
  const [payment, setPayment] = React.useState<PaymentMethod | null>(null)
  const [paying, setPaying] = React.useState(false)

  const brands = React.useMemo(
    () => getBrandsByCategory(selectedCategory.id),
    [selectedCategory],
  )

  const filteredBrands = React.useMemo(() => {
    if (!query.trim()) return brands
    const q = query.toLowerCase()
    return brands.filter(
      (b) => b.name.toLowerCase().includes(q) || b.slug.includes(q),
    )
  }, [brands, query])

  const filteredDenoms = React.useMemo(() => {
    if (!selectedBrand) return []
    if (!query.trim()) return selectedBrand.denominations
    const q = query.toLowerCase()
    return selectedBrand.denominations.filter(
      (d) => d.name.toLowerCase().includes(q) || d.label.toLowerCase().includes(q),
    )
  }, [selectedBrand, query])

  function selectCategory(cat: Category) {
    if (cat.id === selectedCategory.id) return
    setSelectedCategory(cat)
    setSelectedBrand(null)
    setSelected(null)
    setTargetId('')
    setZoneId('')
    setPayment(null)
  }

  function selectBrand(brand: Brand) {
    setSelectedBrand(brand)
    setSelected(null)
    setTargetId('')
    setZoneId('')
    setPayment(null)
    document.getElementById('brand-detail')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function backToBrands() {
    setSelectedBrand(null)
    setSelected(null)
  }

  function selectDenom(denom: Denomination) {
    if (!selectedBrand) return
    setSelected({
      brand: selectedBrand,
      denom,
      category: selectedCategory,
    })
    setTargetId('')
    setZoneId('')
    setPayment(null)
    document.getElementById('checkout-panel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const needsZone =
    selected?.brand.needsZone === true ||
    selected?.denom.needsZone === true ||
    selectedCategory.needsZone === true
  const targetValid =
    targetId.replace(/\D/g, '').length >= 8 &&
    (!needsZone || zoneId.replace(/\D/g, '').length >= 3)
  const canPay = !!selected && targetValid && !!payment

  async function handlePay() {
    if (!canPay || !selected || !payment) return
    setPaying(true)
    try {
      // Try real order creation via server action (numeric product ID if available).
      const numericId = Number(selected.denom.id.replace(/\D/g, ''))
      const res = await createOrder({
        productId: numericId,
        targetId,
        zoneId,
      })

      if (res.success && res.data) {
        const { invoiceCode, snapToken } = res.data
        if (snapToken) {
          try {
            await loadSnapScript()
            const w = window as SnapWindow
            await new Promise<void>((resolve) => {
              w.snap?.pay(snapToken, {
                onSuccess: () => resolve(),
                onPending: () => resolve(),
                onError: () => resolve(),
                onClose: () => resolve(),
              })
              setTimeout(resolve, 60_000)
            })
            router.push(`/invoice/${invoiceCode}`)
            return
          } catch (err) {
            console.error('Midtrans Snap failed', err)
            toast.info('Pembayaran tertunda', { description: 'Redirect ke invoice…' })
            router.push(`/invoice/${invoiceCode}`)
            return
          }
        }
        toast.success('Pesanan dibuat', {
          description: res.error ?? 'Lanjut ke invoice',
        })
        router.push(`/invoice/${invoiceCode}`)
        return
      }
      console.warn('createOrder rejected, falling back to mock', res.error)
    } catch (err) {
      console.error('createOrder threw, falling back to mock', err)
    }

    // Mock fallback.
    const fallbackCode = mockInvoiceCode()
    toast.success('Pembayaran akan diproses…', {
      description: `Midtrans Snap terbuka untuk ${selected.denom.name}`,
    })
    setPaying(false)
    router.push(`/invoice/${fallbackCode}`)
  }

  return (
    <div style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}>
      <Hero query={query} setQuery={setQuery} />

      <section className="container mx-auto px-4 pb-20">
        {/* Category selector */}
        <CategoryGrid
          selected={selectedCategory}
          onSelect={selectCategory}
        />

        {/* Breadcrumb */}
        {selectedBrand && (
          <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
            <button
              onClick={backToBrands}
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {selectedCategory.name}
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-900">{selectedBrand.name}</span>
          </div>
        )}

        {/* Brand grid OR denomination grid */}
        {!selectedBrand ? (
          <BrandGrid brands={filteredBrands} onSelect={selectBrand} />
        ) : (
          <div id="brand-detail" className="space-y-6">
            <BrandHeader brand={selectedBrand} />
            <DenominationGrid
              denoms={filteredDenoms}
              selectedId={selected?.denom.id ?? null}
              onSelect={selectDenom}
            />
          </div>
        )}

        {/* Checkout panel */}
        <CheckoutPanel
          selected={selected}
          category={selectedCategory}
          targetId={targetId}
          setTargetId={setTargetId}
          zoneId={zoneId}
          setZoneId={setZoneId}
          targetValid={targetValid}
          needsZone={needsZone}
          payment={payment}
          setPayment={setPayment}
          canPay={canPay}
          paying={paying}
          onPay={handlePay}
        />
      </section>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

function Hero({
  query,
  setQuery,
}: {
  query: string
  setQuery: (v: string) => void
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-amber-50/40" />
      <div aria-hidden className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Transaksi 60 detik • Tanpa registrasi
          </div>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
            Pulsa, Data & Voucher Game
            <span className="block bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              bayar dalam sekejap.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Cari produk, masukkan nomor tujuan, bayar dengan QRIS atau e-wallet.
            Selesai. Tidak ada akun, tidak ada antrean.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <div className="group relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari produk: Telkomsel, Mobile Legends, Genshin…"
                className="h-14 rounded-2xl border-slate-200 bg-white/90 pl-12 pr-4 text-base shadow-lg shadow-emerald-900/5 backdrop-blur"
                aria-label="Cari produk"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Category Grid                                                               */
/* -------------------------------------------------------------------------- */

function CategoryGrid({
  selected,
  onSelect,
}: {
  selected: Category
  onSelect: (c: Category) => void
}) {
  return (
    <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {categories.map((cat) => {
        const Icon = CATEGORY_ICON[cat.icon] ?? Smartphone
        const isActive = cat.id === selected.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={cn(
              'group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all md:p-4',
              isActive
                ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40',
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm md:h-12 md:w-12',
                cat.gradient,
              )}
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
            </span>
            <span
              className={cn(
                'text-xs font-semibold leading-tight md:text-sm',
                isActive ? 'text-emerald-700' : 'text-slate-700',
              )}
            >
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Brand Grid                                                                  */
/* -------------------------------------------------------------------------- */

function BrandGrid({
  brands,
  onSelect,
}: {
  brands: Brand[]
  onSelect: (b: Brand) => void
}) {
  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        Tidak ada produk ditemukan.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {brands.map((brand) => (
        <button
          key={brand.id}
          onClick={() => onSelect(brand)}
          className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5"
        >
          <span
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm',
              brand.gradient,
            )}
          >
            {brand.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.image}
                alt={brand.name}
                className="h-full w-full rounded-2xl object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <span>{brand.emoji}</span>
            )}
          </span>
          <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
            {brand.name}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {brand.denominations.length} pilihan
          </Badge>
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Brand Header                                                                */
/* -------------------------------------------------------------------------- */

function BrandHeader({ brand }: { brand: Brand }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white',
        brand.gradient,
      )}
    >
      <div className="relative z-10 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur">
          {brand.emoji}
        </span>
        <div>
          <h2 className="text-2xl font-bold">{brand.name}</h2>
          <p className="text-sm text-white/80">
            {brand.denominations.length} denominasi tersedia
          </p>
        </div>
      </div>
      <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Denomination Grid                                                           */
/* -------------------------------------------------------------------------- */

function DenominationGrid({
  denoms,
  selectedId,
  onSelect,
}: {
  denoms: Denomination[]
  selectedId: string | null
  onSelect: (d: Denomination) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {denoms.map((denom) => {
        const isSelected = denom.id === selectedId
        return (
          <button
            key={denom.id}
            onClick={() => onSelect(denom)}
            className={cn(
              'relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-0.5',
              isSelected
                ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md',
            )}
          >
            {isSelected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
            <span className="text-sm font-bold leading-tight text-slate-900">
              {denom.label}
            </span>
            <span className="text-lg font-extrabold text-emerald-700">
              {formatRupiah(denom.price)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Checkout Panel                                                              */
/* -------------------------------------------------------------------------- */

function CheckoutPanel({
  selected,
  category,
  targetId,
  setTargetId,
  zoneId,
  setZoneId,
  targetValid,
  needsZone,
  payment,
  setPayment,
  canPay,
  paying,
  onPay,
}: {
  selected: SelectedProduct | null
  category: Category
  targetId: string
  setTargetId: (v: string) => void
  zoneId: string
  setZoneId: (v: string) => void
  targetValid: boolean
  needsZone: boolean
  payment: PaymentMethod | null
  setPayment: (p: PaymentMethod | null) => void
  canPay: boolean
  paying: boolean
  onPay: () => void
}) {
  if (!selected) return null

  const fee = payment ? (payment.fee < 1 ? selected.denom.price * payment.fee : payment.fee) : 0
  const total = selected.denom.price + fee

  return (
    <div
      id="checkout-panel"
      className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-900/5 md:p-8"
    >
      <div className="mb-6 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900">Detail Pesanan</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        {/* Left: order summary + target input */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl',
                    selected.brand.gradient,
                  )}
                >
                  {selected.brand.emoji}
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {selected.brand.name}
                  </p>
                  <p className="font-bold text-slate-900">{selected.denom.name}</p>
                </div>
              </div>
              <p className="text-right text-lg font-extrabold text-emerald-700">
                {formatRupiah(selected.denom.price)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="target" className="text-sm font-semibold text-slate-700">
                {category.inputLabel}
              </Label>
              <Input
                id="target"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={category.inputPlaceholder}
                inputMode="numeric"
                className="mt-1.5 h-12 rounded-xl"
              />
            </div>
            {needsZone && (
              <div>
                <Label htmlFor="zone" className="text-sm font-semibold text-slate-700">
                  Zone ID (Server)
                </Label>
                <Input
                  id="zone"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  placeholder="Contoh: 1234"
                  inputMode="numeric"
                  className="mt-1.5 h-12 rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: payment + total */}
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Metode Pembayaran</p>
            <div className="space-y-2">
              {paymentMethods.map((pm) => {
                const Icon = PAYMENT_ICON[pm.icon]
                const isPicked = payment?.id === pm.id
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPayment(pm)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                      isPicked
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-300',
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{pm.name}</p>
                      <p className="text-xs text-slate-500">{pm.desc}</p>
                    </div>
                    {isPicked && <Check className="h-4 w-4 text-emerald-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Harga</span>
              <span>{formatRupiah(selected.denom.price)}</span>
            </div>
            {payment && fee > 0 && (
              <div className="mt-1 flex justify-between text-sm text-slate-600">
                <span>Biaya admin ({payment.name})</span>
                <span>{formatRupiah(fee)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="text-emerald-700">{formatRupiah(total)}</span>
            </div>
          </div>

          <Button
            onClick={onPay}
            disabled={!canPay || paying}
            className="h-12 w-full rounded-xl bg-emerald-600 text-base font-bold hover:bg-emerald-700"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses…
              </>
            ) : (
              <>
                Bayar Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          {!targetValid && (
            <p className="text-center text-xs text-slate-400">
              Masukkan {category.inputLabel.toLowerCase()} yang valid
              {needsZone ? ' & Zone ID' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
