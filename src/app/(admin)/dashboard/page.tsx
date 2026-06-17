'use client'

import { useEffect, useState } from 'react'
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'

import { AdminPageHeader } from '@/components/features/admin-page-header'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn, formatRupiah } from '@/lib/utils'
import { getDashboardMetrics } from '@/actions/dashboard'
import type { DashboardMetrics } from '@/actions/dashboard'

interface MetricCardProps {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  trend: string
  accent: string
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/60 shadow-sm">
      <div
        className={cn('absolute inset-x-0 top-0 h-[3px]', accent)}
        aria-hidden
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg',
            accent,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-1">
        <div
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{
            fontFamily: 'var(--font-mono-jb), ui-monospace, monospace',
          }}
        >
          {value}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
          <span className="text-muted-foreground/70">· {hint}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const result = await getDashboardMetrics()
      if (result.success && result.data) {
        setMetrics(result.data)
      } else {
        setError(result.error || 'Failed to load')
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div>
        <AdminPageHeader
          title="Dashboard"
          description="Ringkasan operasional Adnanpay hari ini."
          icon={TrendingUp}
        />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div>
        <AdminPageHeader
          title="Dashboard"
          description="Ringkasan operasional Adnanpay hari ini."
          icon={TrendingUp}
        />
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          {error || 'Unable to load metrics'}
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...metrics.transactions7Days.map((d) => d.count), 1)
  const total7Days = metrics.transactions7Days.reduce((s, d) => s + d.count, 0)

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan operasional Adnanpay hari ini."
        icon={TrendingUp}
      />

      <section
        aria-label="Metrik utama"
        className="grid gap-4 md:grid-cols-3"
      >
        <MetricCard
          label="Saldo Digiflazz"
          value={formatRupiah(metrics.digiflazzBalance)}
          hint="Saldo deposit gateway"
          icon={Wallet}
          trend="3,2%"
          accent="bg-primary/10 text-primary"
        />
        <MetricCard
          label="Transaksi Hari Ini"
          value={String(metrics.transactionsToday)}
          hint="vs kemarin 41"
          icon={ShoppingBag}
          trend="14,6%"
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <MetricCard
          label="Pendapatan Kotor"
          value={formatRupiah(metrics.grossRevenue)}
          hint="Gross revenue hari ini"
          icon={TrendingUp}
          trend="8,1%"
          accent="bg-amber-500/10 text-amber-600"
        />
      </section>

      <section
        aria-label="Grafik transaksi 7 hari"
        className="mt-6 grid gap-4 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Transaksi 7 Hari Terakhir
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total {total7Days} transaksi minggu berjalan
              </p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="inline-block h-2 w-2 rounded-sm bg-primary" />
              Jumlah transaksi
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end justify-between gap-3 sm:gap-4">
              {metrics.transactions7Days.map((entry) => {
                const heightPct = Math.max(
                  (entry.count / maxCount) * 100,
                  4,
                )
                return (
                  <div
                    key={entry.day}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="relative flex w-full flex-1 items-end justify-center">
                      <div
                        className="relative w-full max-w-[42px] rounded-t-md bg-gradient-to-t from-primary/80 to-primary transition-all duration-300 ease-out group-hover:from-primary group-hover:to-primary/90"
                        style={{ height: `${heightPct}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          {entry.count}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {entry.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Catatan Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-lg bg-emerald-500/5 p-3">
              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <p className="text-muted-foreground">
                Sistem berjalan normal —{' '}
                <span className="font-medium text-foreground"> dashboard aktif</span>.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-amber-500/5 p-3">
              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <p className="text-muted-foreground">
                Sinkronisasi produk via{' '}
                <span className="font-medium text-foreground">
                  Digiflazz API
                </span>{' '}
                tersedia.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-3">
              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-primary" />
              <p className="text-muted-foreground">
                {metrics.transactionsToday} transaksi diproses hari ini.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}