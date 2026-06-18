import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap'
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-jb',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Adnanpay — Pulsa, Paket Data & Voucher Game',
  description:
    'Transaksi pulsa, paket data, dan voucher game secepat kilat. Tanpa registrasi, pembayaran instan via QRIS & e-wallet.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${jakarta.variable} ${mono.variable} min-h-screen flex flex-col`}
      style={{
        fontFamily: 'var(--font-jakarta), ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
