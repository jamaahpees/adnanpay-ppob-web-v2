'use client'

import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'
import * as React from 'react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <nav
      className="sticky top-0 z-50 bg-[#0f172a] shadow-lg shadow-slate-900/20"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-600/30 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Adnan<span className="text-[#34d399]">pay</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Beranda
            </Link>
            <Link
              href="/lacak"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Lacak Pesanan
            </Link>
            <div className="ml-3 h-5 w-px bg-white/20" />
            <Link
              href="/login"
              className="ml-2 rounded-xl bg-[#059669] px-5 py-2 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-[#047857] hover:shadow-lg"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-white/10 pb-4 pt-2 md:hidden">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/lacak"
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/login"
              className="mt-2 block rounded-xl bg-[#059669] px-5 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-emerald-600/25"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
