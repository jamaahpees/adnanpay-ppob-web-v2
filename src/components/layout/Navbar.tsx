import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/80 backdrop-blur-xl"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-500/30 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Adnan<span className="text-emerald-600">pay</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              Beranda
            </Link>
            <Link
              href="/lacak"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              Lacak Pesanan
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
