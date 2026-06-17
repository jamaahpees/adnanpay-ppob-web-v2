import { PublicLacakForm } from '@/components/features/public-lacak-form'

export const metadata = {
  title: 'Lacak Pesanan — Adnanpay',
  description: 'Pantau status transaksi Anda dengan kode invoice.',
}

export default function LacakPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mx-auto max-w-lg">
        <div
          className="mb-6 text-center"
          style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Lacak Pesanan
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Cek status transaksi Anda dengan memasukkan kode invoice.
          </p>
        </div>
        <PublicLacakForm />
      </div>
    </div>
  )
}
