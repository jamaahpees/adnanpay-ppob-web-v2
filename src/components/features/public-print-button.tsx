'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintInvoiceButton() {
  return (
    <Button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') window.print()
      }}
      className="no-print gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
    >
      <Printer className="h-4 w-4" />
      Cetak / Simpan PDF
    </Button>
  )
}
