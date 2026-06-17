'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Search,
  LayoutGrid,
  List,
  Smartphone,
  Gamepad2,
  ShoppingCart,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  QrCode,
  Wallet,
  Landmark,
  Zap,
} from 'lucide-react'

import { cn, formatRupiah } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  pulsaProducts,
  gameProducts,
  paymentMethods,
  type PulsaProduct,
  type GameProduct,
  type PaymentMethod,
} from './public-mock-data'

type CatalogMode = 'pulsa' | 'game'
type ViewMode = 'grid' | 'list'

type SelectedProduct = (PulsaProduct | GameProduct) & { kind: CatalogMode }

const PAYMENT_ICON: Record<PaymentMethod['icon'], React.ComponentType<{ className?: string }>> = {
  qr: QrCode,
  wallet: Wallet,
  bank: Landmark,
}

export function PublicHomepage() {
  const [mode, setMode] = React.useState<CatalogMode>('pulsa')
  const [view, setView] = React.useState<ViewMode>('grid')
  const [query, setQuery] = React.useState('')

  const [selected, setSelected] = React.useState<SelectedProduct | null>(null)
  const [targetId, setTargetId] = React.useState('')
  const [zoneId, setZoneId] = React.useState('')
  const [payment, setPayment] = React.useState<PaymentMethod | null>(null)
  const [paying, setPaying] = React.useState(false)

  const list = React.useMemo((): (PulsaProduct | GameProduct)[] => {
    const source = mode === 'pulsa' ? pulsaProducts : gameProducts
    if (!query.trim()) return source
    const q = query.toLowerCase()
    return source.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [mode, query])

  function switchMode(next: CatalogMode) {
    if (next === mode) return
    setMode(next)
    setSelected(null)
    setTargetId('')
    setZoneId('')
    setPayment(null)
  }

  function selectProduct(p: PulsaProduct | GameProduct) {
    setSelected({ ...(p as SelectedProduct), kind: mode })
    setTargetId('')
    setZoneId('')
    setPayment(null)
    // Scroll to checkout panel
    document.getElementById('checkout-panel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const needsZone = selected?.kind === 'game' && (selected as GameProduct).needsZone === true
  const targetValid =
    targetId.replace(/\D/g, '').length >= 8 &&
    (!needsZone || zoneId.replace(/\D/g, '').length >= 3)
  const canPay = !!selected && targetValid && !!payment

  function handlePay() {
    if (!canPay) return
    setPaying(true)
    toast.success('Pembayaran akan diproses…', {
      description: `Meneruskan ke ${payment!.name} untuk ${selected!.name}`,
    })
    setTimeout(() => {
      setPaying(false)
      toast.info('Midtrans Snap akan terbuka di task #4', {
        description: 'Redirect ke /invoice/[code] setelah pembayaran sukses.',
      })
    }, 1100)
  }

  return (
    <div
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <Hero query={query} setQuery={setQuery} />

      <section className="container mx-auto px-4 pb-20">
        <CategoryTabs
          mode={mode}
          onModeChange={switchMode}
          view={view}
          onViewChange={setView}
        >
          <TargetInput
            mode={mode}
            targetId={targetId}
            setTargetId={setTargetId}
            zoneId={zoneId}
            setZoneId={setZoneId}
          />
          <Catalog
            mode={mode}
            view={view}
            list={list}
            selectedId={selected?.id ?? null}
            onSelect={selectProduct}
          />
        </CategoryTabs>

        <CheckoutPanel
          selected={selected}
          targetId={targetId}
          zoneId={zoneId}
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
      <div
        aria-hidden
        className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl"
      />
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
/* Category Tabs + View Toggle                                                 */
/* -------------------------------------------------------------------------- */

function CategoryTabs({
  mode,
  onModeChange,
  view,
  onViewChange,
  children,
}: {
  mode: CatalogMode
  onModeChange: (m: CatalogMode) => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  children: React.ReactNode
}) {
  return (
    <Tabs
      value={mode}
      onValueChange={(v) => onModeChange(v as CatalogMode)}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="h-12 w-full rounded-2xl bg-slate-100 p-1.5 sm:w-auto">
          <TabsTrigger
            value="pulsa"
            className="h-9 flex-1 gap-2 rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm sm:flex-none sm:px-6"
          >
            <Smartphone className="h-4 w-4" />
            Pulsa & Data
          </TabsTrigger>
          <TabsTrigger
            value="game"
            className="h-9 flex-1 gap-2 rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm sm:flex-none sm:px-6"
          >
            <Gamepad2 className="h-4 w-4" />
            Voucher Game
          </TabsTrigger>
        </TabsList>

        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>

      <TabsContent value="pulsa" className="space-y-6 outline-none">
        {children}
      </TabsContent>
      <TabsContent value="game" className="space-y-6 outline-none">
        {children}
      </TabsContent>
    </Tabs>
  )
}

function ViewToggle({
  view,
  onViewChange,
}: {
  view: ViewMode
  onViewChange: (v: ViewMode) => void
}) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        aria-label="Tampilan grid"
        aria-pressed={view === 'grid'}
        className={cn(
          'flex h-9 w-10 items-center justify-center rounded-xl transition-all',
          view === 'grid'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100',
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-label="Tampilan list"
        aria-pressed={view === 'list'}
        className={cn(
          'flex h-9 w-10 items-center justify-center rounded-xl transition-all',
          view === 'list'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100',
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Target Input                                                                */
/* -------------------------------------------------------------------------- */

function TargetInput({
  mode,
  targetId,
  setTargetId,
  zoneId,
  setZoneId,
}: {
  mode: CatalogMode
  targetId: string
  setTargetId: (v: string) => void
  zoneId: string
  setZoneId: (v: string) => void
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur md:p-5">
      {mode === 'pulsa' ? (
        <div className="space-y-2">
          <Label
            htmlFor="target-hp"
            className="text-xs font-bold uppercase tracking-wider text-emerald-700"
          >
            Nomor Tujuan
          </Label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="target-hp"
              inputMode="numeric"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0812 3456 7890"
              className="h-12 rounded-xl border-slate-200 pl-10 text-base"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="target-uid"
              className="text-xs font-bold uppercase tracking-wider text-emerald-700"
            >
              User ID
            </Label>
            <div className="relative">
              <Gamepad2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="target-uid"
                inputMode="numeric"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="123456789"
                className="h-12 rounded-xl border-slate-200 pl-10 text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="target-zone"
              className="text-xs font-bold uppercase tracking-wider text-emerald-700"
            >
              Zone ID (jika diperlukan)
            </Label>
            <Input
              id="target-zone"
              inputMode="numeric"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="1234"
              className="h-12 rounded-xl border-slate-200 text-base"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                     */
/* -------------------------------------------------------------------------- */

function Catalog({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode,
  view,
  list,
  selectedId,
  onSelect,
}: {
  mode: CatalogMode
  view: ViewMode
  list: (PulsaProduct | GameProduct)[]
  selectedId: string | null
  onSelect: (p: PulsaProduct | GameProduct) => void
}) {
  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
        <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-600">
          Tidak ada produk yang cocok.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Coba kata kunci lain atau pindah tab.
        </p>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Produk
              </th>
              <th className="hidden px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:table-cell">
                Kategori
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Harga
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => (
              <tr
                key={p.id}
                className={cn(
                  'ap-animate-in border-b border-slate-50 transition-colors last:border-0 hover:bg-emerald-50/40',
                  selectedId === p.id && 'bg-emerald-50/70',
                )}
                style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white',
                        p.gradient,
                      )}
                    >
                      {p.brand}
                    </span>
                    <span className="font-semibold text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-50 text-slate-600"
                  >
                    {p.category}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono-receipt font-semibold text-slate-900">
                  {formatRupiah(p.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={selectedId === p.id ? 'default' : 'outline'}
                    onClick={() => onSelect(p)}
                    className={
                      selectedId === p.id
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }
                  >
                    {selectedId === p.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Terpilih
                      </>
                    ) : (
                      'Pilih'
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {list.map((p, i) => {
        const isSel = selectedId === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className={cn(
              'ap-animate-in group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/5',
              isSel
                ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                : 'border-slate-200 hover:border-emerald-300',
            )}
            style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
            aria-pressed={isSel}
          >
            <div
              className={cn(
                'relative flex aspect-[5/3] items-center justify-center bg-gradient-to-br',
                p.gradient,
              )}
            >
              <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm md:text-3xl">
                {p.brand}
              </span>
              <Badge
                variant="outline"
                className="absolute left-2 top-2 border-white/40 bg-black/20 text-[10px] font-semibold text-white backdrop-blur"
              >
                {p.category}
              </Badge>
              {isSel && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                {p.name}
              </h3>
              <p className="font-mono-receipt mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                {p.sku}
              </p>
              <div className="mt-auto pt-2">
                <p className="font-bold text-emerald-700">
                  {formatRupiah(p.price)}
                </p>
              </div>
            </div>
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
  targetId,
  zoneId,
  targetValid,
  needsZone,
  payment,
  setPayment,
  canPay,
  paying,
  onPay,
}: {
  selected: SelectedProduct | null
  targetId: string
  zoneId: string
  targetValid: boolean
  needsZone: boolean
  payment: PaymentMethod | null
  setPayment: (p: PaymentMethod | null) => void
  canPay: boolean
  paying: boolean
  onPay: () => void
}) {
  if (!selected) {
    return (
      <div
        id="checkout-panel"
        className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-700">
          Belum ada produk dipilih
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Pilih produk pada katalog di atas. Detail pembayaran akan muncul di sini.
        </p>
      </div>
    )
  }

  const fee = payment ? Math.round(payment.fee * selected.price) : 0
  const total = selected.price + fee

  return (
    <div
      id="checkout-panel"
      className="mt-8 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/5"
    >
      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ShoppingCart className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Ringkasan Pesanan</h2>
            <p className="text-xs text-slate-500">Selesaikan dalam 3 langkah</p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          {selected.kind === 'pulsa' ? 'Pulsa/Data' : 'Game'}
        </Badge>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
        {/* Left: details */}
        <div className="space-y-5">
          <Step
            n={1}
            title="Produk Terpilih"
            done
            className="bg-emerald-50/40"
          >
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-white',
                    selected.gradient,
                  )}
                >
                  {selected.brand}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selected.name}
                  </p>
                  <p className="font-mono-receipt text-[10px] uppercase tracking-wide text-slate-400">
                    SKU {selected.sku}
                  </p>
                </div>
              </div>
              <span className="font-bold text-emerald-700">
                {formatRupiah(selected.price)}
              </span>
            </div>
          </Step>

          <Step
            n={2}
            title="ID Tujuan"
            done={targetValid}
            className={targetValid ? 'bg-emerald-50/40' : ''}
          >
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              {selected.kind === 'pulsa' ? (
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">No. HP:</span>
                  <span className="font-mono-receipt font-semibold text-slate-900">
                    {targetId || '—'}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">User ID:</span>
                    <span className="font-mono-receipt font-semibold text-slate-900">
                      {targetId || '—'}
                    </span>
                  </div>
                  {needsZone && (
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-slate-700">Zone:</span>
                      <span className="font-mono-receipt font-semibold text-slate-900">
                        {zoneId || '—'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {!targetValid && (
                <p className="mt-2 text-xs text-amber-600">
                  Lengkapi ID tujuan di atas untuk melanjutkan.
                </p>
              )}
            </div>
          </Step>

          <Step
            n={3}
            title="Metode Pembayaran"
            done={!!payment}
            className={payment ? 'bg-emerald-50/40' : ''}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {paymentMethods.map((m) => {
                const Icon = PAYMENT_ICON[m.icon]
                const isSel = payment?.id === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayment(m)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
                      isSel
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg',
                        isSel
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-800">{m.name}</span>
                    <span className="text-[10px] leading-tight text-slate-500">
                      {m.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </Step>
        </div>

        {/* Right: total + pay */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Pembayaran
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">{selected.name}</dt>
              <dd className="font-mono-receipt font-semibold text-slate-800">
                {formatRupiah(selected.price)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">
                Biaya {payment ? `(${payment.name})` : ''}
              </dt>
              <dd className="font-mono-receipt text-slate-600">
                {payment ? formatRupiah(fee) : '—'}
              </dd>
            </div>
            <div className="my-2 border-t border-dashed border-slate-300" />
            <div className="flex items-baseline justify-between">
              <dt className="text-sm font-bold text-slate-700">Total</dt>
              <dd className="font-mono-receipt text-2xl font-extrabold text-emerald-700">
                {formatRupiah(total)}
              </dd>
            </div>
          </dl>

          <Button
            type="button"
            disabled={!canPay}
            onClick={onPay}
            className="mt-4 h-12 w-full gap-2 rounded-xl bg-emerald-600 text-base font-bold text-white shadow-md shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none"
          >
            {paying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Memproses…
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 fill-white" /> Bayar Sekarang
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-[11px] leading-tight text-slate-400">
            Dengan melanjutkan, Anda menyetujui ketentuan transaksi Adnanpay.
            Pembayaran diproses oleh Midtrans.
          </p>
        </div>
      </div>
    </div>
  )
}

function Step({
  n,
  title,
  done,
  className,
  children,
}: {
  n: number
  title: string
  done?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-transparent p-3 transition-colors',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
            done
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-200 text-slate-600',
          )}
        >
          {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
        </span>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}
