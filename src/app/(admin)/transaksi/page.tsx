'use client'

import { useEffect, useState, useMemo } from 'react'
import { Receipt, Download, Filter, ArrowUpDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { AdminPageHeader } from '@/components/features/admin-page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatRupiah } from '@/lib/utils'
import { getAdminOrders } from '@/actions/dashboard'
import type { AdminOrder } from '@/actions/dashboard'

const NUMERIC_MONO = {
  fontFamily: 'var(--font-mono-jb), ui-monospace, monospace',
} as const

type StatusFilter = 'all' | 'success' | 'pending' | 'failed'

const STATUS_VARIANT: Record<string, { label: string; classes: string }> = {
  success: {
    label: 'Sukses',
    classes: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
  },
  pending: {
    label: 'Pending',
    classes: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
  },
  failed: {
    label: 'Gagal',
    classes: 'border-red-500/20 bg-red-500/10 text-red-600',
  },
}

function StatusBadge({ status }: { status: string }) {
  const conf = STATUS_VARIANT[status] || STATUS_VARIANT.pending
  return (
    <Badge variant="outline" className={cn('font-medium', conf.classes)}>
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {conf.label}
    </Badge>
  )
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadCsv(rows: AdminOrder[]) {
  const headers = [
    'ID',
    'Tanggal',
    'Invoice',
    'Item',
    'Tujuan',
    'Harga Modal',
    'Harga Jual',
    'Profit',
    'Status Bayar',
    'Status Fulfillment',
  ]
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.date,
        r.invoice,
        r.item,
        r.target,
        r.basePrice,
        r.sellPrice,
        r.profit,
        r.paymentStatus,
        r.fulfillmentStatus,
      ]
        .map(escapeCsv)
        .join(','),
    )
  }
  const csv = lines.join('\n')
  const blob = new Blob([`﻿${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const filename = `transaksi-adnanpay-${stamp}.csv`
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export default function AdminTransaksiPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sortNewest, setSortNewest] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getAdminOrders(100, 0)
      if (result.success && result.data) {
        setOrders(result.data)
      } else {
        setError(result.error || 'Failed to load')
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let list: AdminOrder[] = [...orders]
    if (statusFilter !== 'all') {
      list = list.filter((o) => o.paymentStatus === statusFilter)
    }
    if (from) {
      list = list.filter((o) => o.date >= from)
    }
    if (to) {
      list = list.filter((o) => o.date <= to)
    }
    list.sort((a, b) =>
      sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    )
    return list
  }, [orders, statusFilter, from, to, sortNewest])

  const totalProfit = filtered.reduce((s, o) => s + o.profit, 0)
  const successCount = filtered.filter(
    (o) => o.paymentStatus === 'success',
  ).length

  function handleExport() {
    if (filtered.length === 0) {
      toast.error('Tidak ada data untuk diekspor', {
        description: 'Ubah filter lalu coba lagi.',
      })
      return
    }
    downloadCsv(filtered)
    toast.success('CSV diunduh', {
      description: `${filtered.length} baris transaksi diekspor.`,
    })
  }

  if (loading) {
    return (
      <div>
        <AdminPageHeader
          title="Riwayat Transaksi"
          description="Daftar komprehensif transaksi pelanggan."
          icon={Receipt}
        />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <AdminPageHeader
          title="Riwayat Transaksi"
          description="Daftar komprehensif transaksi pelanggan."
          icon={Receipt}
        />
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <AdminPageHeader
        title="Riwayat Transaksi"
        description="Daftar komprehensif transaksi pelanggan lengkap dengan status pembayaran Midtrans dan fulfillment Digiflazz."
        icon={Receipt}
        actions={
          <Button onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm md:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filter
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Status Pembayaran
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
            className={cn(
              'h-9 w-full rounded-md border border-input bg-background px-3 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            )}
          >
            <option value="all">Semua status</option>
            <option value="success">Sukses</option>
            <option value="pending">Pending</option>
            <option value="failed">Gagal</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Dari Tanggal
          </label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Sampai Tanggal
          </label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{' '}
          transaksi
        </span>
        <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
          <span className="font-semibold text-foreground">{successCount}</span>{' '}
          sukses
        </span>
        <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
          Profit total{' '}
          <span
            className="font-semibold text-foreground"
            style={NUMERIC_MONO}
          >
            {formatRupiah(totalProfit)}
          </span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortNewest((v) => !v)}
          className="ml-auto h-7 text-xs"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortNewest ? 'Terbaru → Lama' : 'Terlama → Baru'}
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead className="w-[120px]">Tanggal</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead className="text-right">Modal</TableHead>
              <TableHead className="text-right">Jual</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="w-[110px]">Bayar</TableHead>
              <TableHead className="w-[120px]">Fulfillment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-10 text-center text-muted-foreground"
                >
                  Tidak ada transaksi yang cocok dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground">
                    #{order.id}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs text-muted-foreground"
                    style={NUMERIC_MONO}
                  >
                    {order.date}
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-xs font-semibold text-foreground"
                      style={NUMERIC_MONO}
                    >
                      {order.invoice}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {order.item}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.target}
                  </TableCell>
                  <TableCell
                    className="text-right font-mono text-xs tabular-nums text-muted-foreground"
                    style={NUMERIC_MONO}
                  >
                    {formatRupiah(order.basePrice)}
                  </TableCell>
                  <TableCell
                    className="text-right font-mono text-sm font-semibold tabular-nums text-foreground"
                    style={NUMERIC_MONO}
                  >
                    {formatRupiah(order.sellPrice)}
                  </TableCell>
                  <TableCell
                    className="text-right font-mono text-xs font-semibold tabular-nums text-emerald-600"
                    style={NUMERIC_MONO}
                  >
                    +{formatRupiah(order.profit)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.fulfillmentStatus} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}