import Link from 'next/link'
import { Zap, ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="border-t border-emerald-100/70 bg-slate-50/60 mt-auto"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Adnan<span className="text-emerald-600">pay</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Platform PPOB tercepat untuk pulsa, paket data, dan voucher game.
              Transaksi tanpa registrasi.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Navigasi
            </h4>
            <Link
              href="/"
              className="block text-sm font-medium text-slate-600 hover:text-emerald-700"
            >
              Beranda
            </Link>
            <Link
              href="/lacak"
              className="block text-sm font-medium text-slate-600 hover:text-emerald-700"
            >
              Lacak Pesanan
            </Link>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Keamanan
            </h4>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Pembayaran aman via Midtrans
            </div>
            <p className="text-xs text-slate-400">
              QRIS, GoPay, DANA, OVO, dan Bank Transfer tersedia.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Adnanpay. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
