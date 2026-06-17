import { notFound } from 'next/navigation'
import { CheckCircle2, Zap, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatRupiah, cn } from '@/lib/utils'
import { getMockInvoice } from '@/components/features/public-mock-data'
import { PrintInvoiceButton } from '@/components/features/public-print-button'

interface PageProps {
  params: { code: string }
}

export function generateMetadata({ params }: PageProps) {
  return {
    title: `Invoice ${params.code} — Adnanpay`,
    description: 'Struk digital transaksi Adnanpay.',
  }
}

export default function InvoicePage({ params }: PageProps) {
  const code = decodeURIComponent(params.code)
  if (!code) notFound()

  const invoice = getMockInvoice(code)
  const date = new Date(invoice.dateIso)
  const dateLabel = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeLabel = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="container mx-auto px-4 py-10 md:py-14"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <div className="mx-auto max-w-md print-area">
        {/* Top action bar (hidden on print) */}
        <div className="no-print mb-4 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
              <Zap className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
            </span>
            <span className="font-extrabold text-slate-900">Adnanpay</span>
          </a>
          <PrintInvoiceButton />
        </div>

        {/* Receipt card */}
        <article className="print-card relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-emerald-900/10">
          {/* Header band */}
          <header className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-7 text-white">
            <div
              aria-hidden
              className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                    <Zap className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">
                    Adnanpay
                  </span>
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-widest text-emerald-50/80">
                  Bukti Transaksi
                </p>
                <h1 className="font-mono-receipt text-base font-semibold tracking-wider">
                  {invoice.code}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className="bg-white/20 text-white hover:bg-white/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Lunas
                </Badge>
                <span className="text-[10px] text-emerald-50/80">
                  #{invoice.fulfillmentStatus}
                </span>
              </div>
            </div>
          </header>

          {/* Meta rows */}
          <section className="grid grid-cols-2 gap-px bg-slate-100 text-sm">
            <MetaCell label="Tanggal" value={`${dateLabel} • ${timeLabel}`} />
            <MetaCell label="Pembayaran" value={invoice.payStatus} />
          </section>

          {/* Item */}
          <section className="space-y-4 px-6 py-6">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Item Dibeli
              </h2>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50/50 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{invoice.item}</p>
                  <p className="font-mono-receipt mt-0.5 text-xs text-slate-500">
                    Tujuan: {invoice.targetId}
                  </p>
                </div>
                <p className="font-mono-receipt font-bold text-emerald-700">
                  {formatRupiah(invoice.price)}
                </p>
              </div>
            </div>

            <dl className="space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
              <Row label="Subtotal" value={formatRupiah(invoice.price)} />
              <Row label="Biaya Layanan" value="Rp 0" muted />
              <div className="my-1 border-t border-dashed border-slate-300" />
              <div className="flex items-baseline justify-between">
                <dt className="text-sm font-bold text-slate-800">Total Bayar</dt>
                <dd className="font-mono-receipt text-xl font-extrabold text-slate-900">
                  {formatRupiah(invoice.price)}
                </dd>
              </div>
            </dl>

            {/* SN */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Serial Number (SN)
              </p>
              <p className="font-mono-receipt mt-1 break-all text-xs font-semibold text-slate-800">
                {invoice.sn}
              </p>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                Simpan SN sebagai bukti pengisian berhasil. Cek status via menu
                Lacak Pesanan kapan saja.
              </p>
            </div>

            {/* Footer / trust */}
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Transaksi aman — diproses oleh Midtrans &amp; Digiflazz
            </div>
          </section>
        </article>

        <p className="no-print mt-4 text-center text-xs text-slate-400">
          Butuh bantuan? Hubungi support@adnanpay.id
        </p>
      </div>
    </div>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-6 py-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          'font-mono-receipt font-medium',
          muted ? 'text-slate-500' : 'text-slate-800',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
