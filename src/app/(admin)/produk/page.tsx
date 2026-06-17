'use client'

import { useMemo, useState } from 'react'
import { RefreshCw, Search, Package, X } from 'lucide-react'
import { toast } from 'sonner'

import { AdminPageHeader } from '@/components/features/admin-page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import {
  products as seedProducts,
  type AdminProduct,
  type ProductCategory,
} from '@/components/features/admin-mock-data'

const CATEGORY_BADGE: Record<ProductCategory, string> = {
  Pulsa: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  Data: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  Game: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20',
}

export default function AdminProdukPage() {
  const [items, setItems] = useState<AdminProduct[]>(seedProducts)
  const [query, setQuery] = useState('')
  const [syncing, setSyncing] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [items, query])

  const activeCount = items.filter((p) => p.isActive).length

  function toggleActive(sku: string, next: boolean) {
    setItems((prev) =>
      prev.map((p) => (p.sku === sku ? { ...p, isActive: next } : p)),
    )
    const product = items.find((p) => p.sku === sku)
    if (product) {
      toast.success(next ? 'Produk diaktifkan' : 'Produk dinonaktifkan', {
        description: `${product.name} ${next ? 'tampil' : 'disembunyikan'} dari katalog publik.`,
      })
    }
  }

  function runSync() {
    setSyncing(true)
    toast.info('Memulai sync Digiflazz', {
      description: 'Mengambil SKU terbaru dari gateway…',
    })
    setTimeout(() => {
      setSyncing(false)
      toast.success('Sync selesai', {
        description: `${items.length} produk berhasil diperbarui.`,
      })
    }, 1200)
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Produk"
        description="Sinkronkan katalog dari Digiflazz danatur visibilitas produk di halaman publik."
        icon={Package}
        actions={
          <Button onClick={runSync} disabled={syncing} variant="default">
            <RefreshCw
              className={cn('h-4 w-4', syncing && 'animate-spin')}
            />
            {syncing ? 'Syncing…' : 'Sync Digiflazz'}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari SKU atau nama produk…"
            className="pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{activeCount}</span>{' '}
          dari {items.length} produk aktif
          {query ? (
            <>
              {' · '}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{' '}
              cocok dengan pencarian
            </>
          ) : null}
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[120px]">SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="w-[120px]">Kategori</TableHead>
              <TableHead className="w-[160px] text-right">Harga Modal</TableHead>
              <TableHead className="w-[120px] text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Tidak ada produk yang cocok dengan{' '}
                  <span className="font-medium text-foreground">
                    &ldquo;{query}&rdquo;
                  </span>
                  .
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.sku} className="group">
                  <TableCell>
                    <span
                      className="font-mono text-xs font-semibold tracking-wide text-foreground"
                      style={{
                        fontFamily:
                          'var(--font-mono-jb), ui-monospace, monospace',
                      }}
                    >
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'border font-medium',
                        CATEGORY_BADGE[product.category],
                      )}
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-right font-mono tabular-nums text-foreground"
                    style={{
                      fontFamily:
                        'var(--font-mono-jb), ui-monospace, monospace',
                    }}
                  >
                    {formatRupiah(product.basePrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={(next) =>
                          toggleActive(product.sku, next)
                        }
                        aria-label={`Toggle aktif untuk ${product.name}`}
                      />
                      <span
                        className={cn(
                          'text-xs font-medium',
                          product.isActive
                            ? 'text-emerald-600'
                            : 'text-muted-foreground',
                        )}
                      >
                        {product.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
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
