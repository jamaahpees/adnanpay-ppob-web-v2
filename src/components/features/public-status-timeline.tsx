'use client'

import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type TrackStatus = 'pending' | 'proses' | 'berhasil' | 'gagal'

interface Step {
  key: TrackStatus
  label: string
  desc: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  { key: 'pending', label: 'Pending Pembayaran', desc: 'Menunggu konfirmasi pembayaran', icon: Clock },
  { key: 'proses',  label: 'Diproses',            desc: 'Transaksi diteruskan ke operator',  icon: Loader2 },
  { key: 'berhasil',label: 'Berhasil',            desc: 'Pulsa/voucher telah terkirim',      icon: CheckCircle2 },
  { key: 'gagal',   label: 'Gagal',               desc: 'Transaksi tidak dapat diselesaikan', icon: XCircle },
]

const ORDER: TrackStatus[] = ['pending', 'proses', 'berhasil']

export function StatusTimeline({ status }: { status: TrackStatus }) {
  // 'gagal' renders as a special terminated branch
  const failed = status === 'gagal'
  const reachedIndex = failed ? 1 : ORDER.indexOf(status)

  return (
    <ol
      className="relative space-y-5 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-slate-200"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      {STEPS.map((s) => {
        const reached = !failed && ORDER.indexOf(s.key) <= reachedIndex
        const current = !failed && s.key === status
        const isFailedNode = failed && s.key === 'gagal'

        return (
          <li key={s.key} className="relative flex gap-4">
            <span
              className={cn(
                'z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                reached && !isFailedNode && 'border-emerald-500 bg-emerald-500 text-white',
                current && !isFailedNode && 'ring-4 ring-emerald-500/20',
                isFailedNode && 'border-red-500 bg-red-500 text-white',
                !reached && !isFailedNode && 'border-slate-200 bg-white text-slate-400',
              )}
            >
              <s.icon
                className={cn('h-4 w-4', current && s.key === 'proses' && 'animate-spin')}
              />
            </span>
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'text-sm font-bold',
                    reached || isFailedNode ? 'text-slate-900' : 'text-slate-500',
                  )}
                >
                  {s.label}
                </p>
                {current && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Saat ini
                  </span>
                )}
                {isFailedNode && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                    Gagal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
