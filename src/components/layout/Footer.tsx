import Link from 'next/link'
import { Zap, ShieldCheck, MessageCircle, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="bg-[#0f172a] text-white"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-600/20">
                <Zap className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Adnan<span className="text-[#34d399]">pay</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Platform PPOB tercepat untuk pulsa, paket data, dan voucher game.
              Transaksi tanpa registrasi.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <ShieldCheck className="h-4 w-4 text-[#059669]" />
              Pembayaran aman via Midtrans
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Navigasi
            </h4>
            <Link
              href="/"
              className="block text-sm font-medium text-slate-300 transition-colors hover:text-[#34d399]"
            >
              Beranda
            </Link>
            <Link
              href="/lacak"
              className="block text-sm font-medium text-slate-300 transition-colors hover:text-[#34d399]"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/login"
              className="block text-sm font-medium text-slate-300 transition-colors hover:text-[#34d399]"
            >
              Login
            </Link>
          </div>

          {/* Layanan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Layanan
            </h4>
            <p className="text-sm text-slate-300">Pulsa & Paket Data</p>
            <p className="text-sm text-slate-300">Voucher Game</p>
            <p className="text-sm text-slate-300">Saldo E-Money</p>
            <p className="text-sm text-slate-300">Token PLN</p>
            <p className="text-sm text-slate-300">Streaming</p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hubungi Kami
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MessageCircle className="h-4 w-4 text-[#059669]" />
              WhatsApp: +62 8xx-xxxx-xxxx
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-[#059669]" />
              support@adnanpay.com
            </div>
            <p className="text-xs text-slate-500">QRIS, GoPay, DANA, OVO, dan Bank Transfer tersedia.</p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Adnanpay. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
