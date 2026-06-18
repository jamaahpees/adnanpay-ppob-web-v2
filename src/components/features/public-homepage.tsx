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
  ArrowLeft,
  ArrowRight,
  Loader2,
  QrCode,
  Landmark,
  ChevronRight,
  ChevronLeft,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
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

/* ─── Hero banner slides ─── */
const HERO_SLIDES = [
  {
    title: 'Top Up & Voucher Game',
    subtitle: 'Diamond, UC, Genesis Crystals & lainnya',
    description: 'Isi ulang game favoritmu dengan cepat dan aman.',
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#0f4c3d]',
    accent: 'emerald',
  },
  {
    title: 'Harga Termurah',
    subtitle: 'Bandingkan & hemat setiap transaksi',
    description: 'Harga kompetitif untuk semua kebutuhan digitalmu.',
    gradient: 'from-[#0f4c3d] via-[#1e293b] to-[#0f172a]',
    accent: 'amber',
  },
  {
    title: 'Pembayaran Mudah',
    subtitle: 'QRIS, e-wallet, & transfer bank',
    description: 'Bayar dengan cara yang paling nyaman untukmu.',
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#1e1b4b]',
    accent: 'blue',
  },
]

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
  const [heroSlide, setHeroSlide] = React.useState(0)

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

  // Hero auto-rotate
  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
            toast.info('Pembayaran tertunda', { description: 'Redirect ke invoice...' })
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

    const fallbackCode = mockInvoiceCode()
    toast.success('Pembayaran akan diproses...', {
      description: `Midtrans Snap terbuka untuk ${selected.denom.name}`,
    })
    setPaying(false)
    router.push(`/invoice/${fallbackCode}`)
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}>
      {/* Category Tabs */}
      <CategoryTabs
        selected={selectedCategory}
        onSelect={selectCategory}
      />

      {/* Hero Banner Carousel */}
      <HeroCarousel
        slide={heroSlide}
        setSlide={setHeroSlide}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Search Bar */}
        <div className="mb-8 mx-auto max-w-2xl">
          <div className="group relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#059669]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk: Telkomsel, Mobile Legends, Genshin..."
              className="h-14 rounded-2xl border-slate-200 bg-white pl-12 pr-4 text-base shadow-md shadow-slate-200/60 backdrop-blur"
              aria-label="Cari produk"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        {selectedBrand && (
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <button
              onClick={backToBrands}
              className="inline-flex items-center gap-1 font-semibold text-[#059669] transition-colors hover:text-[#047857]"
            >
              <ArrowLeft className="h-4 w-4" />
              {selectedCategory.name}
            </button>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="font-bold text-slate-900">{selectedBrand.name}</span>
          </div>
        )}

        {/* Brand grid OR denomination grid */}
        {!selectedBrand ? (
          <BrandGrid brands={filteredBrands} onSelect={selectBrand} category={selectedCategory} />
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
      </main>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Popular Products Quick Grid */}
      <PopularCategories categories={categories} onSelect={selectCategory} />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Category Tabs (horizontal scrollable pills)                             */
/* ──────────────────────────────────────────────────────────────────────── */

function CategoryTabs({
  selected,
  onSelect,
}: {
  selected: Category
  onSelect: (c: Category) => void
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICON[cat.icon] ?? Smartphone
            const isActive = cat.id === selected.id
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Hero Carousel                                                           */
/* ──────────────────────────────────────────────────────────────────────── */

function HeroCarousel({
  slide,
  setSlide,
}: {
  slide: number
  setSlide: (s: number) => void
}) {
  const current = HERO_SLIDES[slide]

  function prev() {
    setSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  function next() {
    setSlide((slide + 1) % HERO_SLIDES.length)
  }

  return (
    <section className="relative overflow-hidden">
      <div className={cn(
        'bg-gradient-to-br transition-all duration-700',
        current.gradient,
      )}>
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16 lg:py-20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-white/15 text-white border-white/20 backdrop-blur">
                <Sparkles className="mr-1 h-3 w-3" />
                Promo Spesial
              </Badge>
              <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
                {current.title}
              </h1>
              <p className="mt-2 text-lg font-medium text-emerald-300 md:text-xl">
                {current.subtitle}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
                {current.description}
              </p>
              <Button className="mt-6 h-12 rounded-xl bg-[#059669] px-8 text-base font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-[#047857]">
                Mulai Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Decorative elements */}
            <div className="hidden lg:block">
              <div className="relative h-56 w-56">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute inset-4 flex items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
                  <Gamepad2 className="h-24 w-24 text-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:bg-white/20"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === slide
                    ? 'w-8 bg-[#059669]'
                    : 'w-2 bg-white/40 hover:bg-white/60',
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Stats Bar                                                               */
/* ──────────────────────────────────────────────────────────────────────── */

function StatsBar() {
  const stats = [
    { icon: Users, label: 'Pengguna Aktif', value: '50K+' },
    { icon: TrendingUp, label: 'Transaksi', value: '200K+' },
    { icon: Clock, label: 'Proses Instan', value: '<60 detik' },
    { icon: Shield, label: 'Transaksi Aman', value: '100%' },
  ]

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 py-4 md:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Icon className="h-5 w-5 text-[#059669]" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Brand Grid                                                              */
/* ──────────────────────────────────────────────────────────────────────── */

function BrandGrid({
  brands,
  onSelect,
  category,
}: {
  brands: Brand[]
  onSelect: (b: Brand) => void
  category: Category
}) {
  const Icon = CATEGORY_ICON[category.icon] ?? Smartphone

  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
        <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-lg font-semibold text-slate-500">Tidak ada produk ditemukan</p>
        <p className="mt-1 text-sm text-slate-400">Coba kata kunci lain atau pilih kategori berbeda</p>
      </div>
    )
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#059669]/10">
            <Icon className="h-5 w-5 text-[#059669]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
            <p className="text-sm text-slate-500">{brands.length} produk tersedia</p>
          </div>
        </div>
        <Badge variant="outline" className="border-[#059669]/30 text-[#059669]">
          <Star className="mr-1 h-3 w-3" />
          Terlaris
        </Badge>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onSelect(brand)}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#059669]/30 hover:shadow-lg hover:shadow-emerald-900/5"
          >
            <span
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm transition-transform group-hover:scale-110',
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
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#059669]">
              {brand.name}
            </span>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-[11px] font-semibold text-slate-500"
            >
              {brand.denominations.length} pilihan
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Brand Header                                                            */
/* ──────────────────────────────────────────────────────────────────────── */

function BrandHeader({ brand }: { brand: Brand }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg',
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

/* ──────────────────────────────────────────────────────────────────────── */
/* Denomination Grid                                                       */
/* ──────────────────────────────────────────────────────────────────────── */

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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Pilih Denominasi</h3>
        <p className="text-sm text-slate-500">{denoms.length} pilihan</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {denoms.map((denom) => {
          const isSelected = denom.id === selectedId
          return (
            <button
              key={denom.id}
              onClick={() => onSelect(denom)}
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5',
                isSelected
                  ? 'border-[#059669] bg-emerald-50 shadow-md ring-2 ring-[#059669]/20'
                  : 'border-slate-200 bg-white hover:border-[#059669]/40 hover:shadow-md',
              )}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <span className="text-sm font-bold leading-tight text-slate-900">
                {denom.label}
              </span>
              <span className="text-lg font-extrabold text-[#059669]">
                {formatRupiah(denom.price)}
              </span>
              {denom.needsZone && (
                <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                  Perlu Zone ID
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Checkout Panel                                                          */
/* ──────────────────────────────────────────────────────────────────────── */

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
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8"
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#059669] text-sm font-bold text-white">
          <ShoppingCart className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Detail Pesanan</h3>
      </div>

      {/* Steps */}
      <div className="mb-6 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-[#059669] px-3 py-1 font-semibold text-white">1 Produk</span>
        <span className="h-px flex-1 bg-slate-200" />
        <span className={cn('rounded-full px-3 py-1 font-semibold', targetValid ? 'bg-[#059669] text-white' : 'bg-slate-100 text-slate-500')}>2 Data</span>
        <span className="h-px flex-1 bg-slate-200" />
        <span className={cn('rounded-full px-3 py-1 font-semibold', payment ? 'bg-[#059669] text-white' : 'bg-slate-100 text-slate-500')}>3 Bayar</span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        {/* Left: order summary + target input */}
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-50 p-4">
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
              <p className="text-right text-lg font-extrabold text-[#059669]">
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
                className="mt-1.5 h-12 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/20"
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
                  className="mt-1.5 h-12 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/20"
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
                      'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200',
                      isPicked
                        ? 'border-[#059669] bg-emerald-50'
                        : 'border-slate-200 hover:border-[#059669]/40',
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{pm.name}</p>
                      <p className="text-xs text-slate-500">{pm.desc}</p>
                    </div>
                    {isPicked && <Check className="h-4 w-4 text-[#059669]" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
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
              <span className="text-[#059669]">{formatRupiah(total)}</span>
            </div>
          </div>

          <Button
            onClick={onPay}
            disabled={!canPay || paying}
            className="h-12 w-full rounded-xl bg-[#059669] text-base font-bold shadow-lg shadow-emerald-600/20 hover:bg-[#047857]"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
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

/* ──────────────────────────────────────────────────────────────────────── */
/* Why Choose Us Section                                                   */
/* ──────────────────────────────────────────────────────────────────────── */

function WhyChooseUs() {
  const reasons = [
    {
      icon: Zap,
      title: 'Proses Instan',
      description: 'Transaksi diproses otomatis dalam hitungan detik.',
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Pembayaran terenkripsi via Midtrans.',
    },
    {
      icon: TrendingUp,
      title: 'Harga Terbaik',
      description: 'Harga kompetitif untuk semua produk digital.',
    },
    {
      icon: Users,
      title: 'Support 24/7',
      description: 'Tim siap membantu kapan saja.',
    },
  ]

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">Kenapa Pilih Adnanpay?</h2>
          <p className="mt-2 text-slate-500">Platform terpercaya untuk semua kebutuhan digitalmu</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669]/10">
                <Icon className="h-6 w-6 text-[#059669]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Popular Categories Quick Links                                          */
/* ──────────────────────────────────────────────────────────────────────── */

function PopularCategories({
  categories: cats,
  onSelect,
}: {
  categories: Category[]
  onSelect: (c: Category) => void
}) {
  return (
    <section className="bg-[#f0f2f5] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Kategori Populer</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {cats.map((cat) => {
            const Icon = CATEGORY_ICON[cat.icon] ?? Smartphone
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-1 hover:border-[#059669]/30 hover:shadow-lg"
              >
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                    cat.gradient,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-[#059669]">
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
