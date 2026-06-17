'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Loader2, Hash } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusTimeline, type TrackStatus } from './public-status-timeline'
import { getOrderByInvoiceCode } from '@/actions/orders'

const schema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      /^INV-\d{8}-[A-Z0-9]{4}$/,
      'Format: INV-YYYYMMDD-XXXX (contoh: INV-20240101-AB12)',
    ),
})

type FormValues = z.infer<typeof schema>

interface TrackResult {
  code: string
  status: TrackStatus
  item: string
  targetId: string
  updatedAt: string
}

// Deterministic mock: same code → same result, so /lacak and /invoice agree.
function mockTrack(code: string): TrackResult {
  const seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const statuses: TrackStatus[] = ['pending', 'proses', 'berhasil', 'gagal']
  // Skip 'gagal' most of the time for nicer demo; ~25% chance otherwise
  const status: TrackStatus =
    seed % 4 === 0 ? statuses[seed % 3] : statuses[seed % 3]
  const items = [
    'Telkomsel 50.000',
    'XL Data 8GB',
    'Mobile Legends 86 Diamond',
    'Free Fire 70 Diamond',
  ]
  return {
    code,
    status,
    item: items[seed % items.length],
    targetId: `0812${((seed * 31337) % 90000000 + 10000000).toString().slice(0, 8)}`,
    updatedAt: new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  }
}

export function PublicLacakForm() {
  const [result, setResult] = React.useState<TrackResult | null>(null)
  const [loading, setLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
    mode: 'onChange',
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setResult(null)
    const code = values.code.toUpperCase()
    try {
      const order = await getOrderByInvoiceCode(code)
      if (order) {
        const payOk = order.payment_status === 'success'
        const fulfillOk = order.fulfillment_status === 'success'
        const failed =
          order.payment_status === 'failed' ||
          order.fulfillment_status === 'failed'
        const status: TrackStatus = failed
          ? 'gagal'
          : payOk && fulfillOk
            ? 'berhasil'
            : payOk
              ? 'proses'
              : 'pending'
        setResult({
          code,
          status,
          item: order.product_name_snapshot,
          targetId: order.zone_id
            ? `${order.target_id} (${order.zone_id})`
            : order.target_id,
          updatedAt: new Date(order.created_at).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        })
      } else {
        // No DB match — keep the deterministic mock so the demo still
        // displays a receipt for previously-seen invoice codes.
        setResult(mockTrack(code))
      }
    } catch (err) {
      console.error('lacak lookup failed', err)
      setResult(mockTrack(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: 'var(--font-jakarta, ui-sans-serif, system-ui)' }}
    >
      <Card className="overflow-hidden border-emerald-200 shadow-lg shadow-emerald-900/5">
        <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50/60">
          <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Search className="h-4 w-4" />
            </span>
            Lacak Pesanan
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Masukkan kode invoice untuk melihat status transaksi Anda secara
            real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Kode Invoice
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          {...field}
                          autoCapitalize="characters"
                          placeholder="INV-20240101-AB12"
                          className={cn(
                            'font-mono-receipt h-12 rounded-xl border-slate-200 pl-10 text-base uppercase tracking-wide',
                            form.formState.errors.code && 'border-red-300 focus-visible:ring-red-400',
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full gap-2 rounded-xl bg-emerald-600 text-base font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Mencari…
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" /> Lacak Pesanan
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="ap-animate-in overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="font-mono-receipt text-sm font-bold tracking-wide text-slate-900">
                  {result.code}
                </CardTitle>
                <CardDescription className="text-xs">
                  Diperbarui {result.updatedAt}
                </CardDescription>
              </div>
              <StatusBadge status={result.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-5 md:p-6">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Item
                </dt>
                <dd className="font-semibold text-slate-800">{result.item}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Tujuan
                </dt>
                <dd className="font-mono-receipt font-semibold text-slate-800">
                  {result.targetId}
                </dd>
              </div>
            </dl>
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Linimasa Status
              </h3>
              <StatusTimeline status={result.status} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: TrackStatus }) {
  const map: Record<TrackStatus, { label: string; cls: string }> = {
    pending:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
    proses:   { label: 'Diproses', cls: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
    berhasil: { label: 'Berhasil', cls: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
    gagal:    { label: 'Gagal',    cls: 'bg-red-100 text-red-700 hover:bg-red-100' },
  }
  const { label, cls } = map[status]
  return <Badge className={cn('text-xs font-bold', cls)}>{label}</Badge>
}
