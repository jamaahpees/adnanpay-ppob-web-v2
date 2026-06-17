import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Toaster } from '@/components/ui/sonner'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono-jb',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Admin · Adnanpay PPOB',
  description: 'Dashboard admin Adnanpay — produk, pricing, dan transaksi.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${jakarta.variable} ${mono.variable} min-h-screen bg-[hsl(220,23%,97%)] text-foreground`}
      style={{
        fontFamily:
          'var(--font-jakarta), ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
