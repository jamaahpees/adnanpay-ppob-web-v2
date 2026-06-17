'use client'

import { useMemo, useState } from 'react'
import { Tags, Calculator, RotateCcw } from 'lucide-react'
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
import {
  pricingRules as seedRules,
  computeFinalPrice,
  type MarginType,
  type PricingRule,
} from '@/components/features/admin-mock-data'

const NUMERIC_MONO = {
  fontFamily: 'var(--font-mono-jb), ui-monospace, monospace',
} as const

// Native select styled to match shadcn Input. Keeps deps lean (no @radix-ui/react-select).
function MarginTypeSelect({
  value,
  onChange,
}: {
  value: MarginType
  onChange: (next: MarginType) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MarginType)}
      className={cn(
        'h-9 w-full rounded-md border border-input bg-background px-3 text-sm',
        'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
      )}
      aria-label="Tipe margin"
    >
      <option value="fixed">Fixed (Rp)</option>
      <option value="percentage">Percentage (%)</option>
    </select>
  )
}

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>(seedRules)

  const summary = useMemo(() => {
    const total = rules.length
    const byCategory = rules.filter((r) => r.scope === 'category').length
    const bySku = rules.filter((r) => r.scope === 'sku').length
    const avgFinal =
      rules.reduce(
        (s, r) => s + computeFinalPrice(r.basePriceAvg, r.marginType, r.marginValue),
        0,
      ) / Math.max(total, 1)
    return { total, byCategory, bySku, avgFinal }
  }, [rules])

  function updateRule(id: string, patch: Partial<PricingRule>) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    )
  }

  function resetRule(id: string) {
    const original = seedRules.find((r) => r.id === id)
    if (original) {
      setRules((prev) => prev.map((r) => (r.id === id ? original : r)))
      toast('Aturan dikembalikan ke nilai awal')
    }
  }

  function saveAll() {
    toast.success('Margin disimpan', {
      description: `${rules.length} aturan pricing diterapkan ke katalog publik.`,
    })
  }

  return (
    <div>
      <AdminPageHeader
        title="Master Pricing"
        description="Harga Jual Final = Harga Modal + Margin. Perubahan diterapkan ke katalog setelah disimpan."
        icon={Tags}
        actions={
          <>
            <Button variant="outline" onClick={() => setRules(seedRules)}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={saveAll}>
              <Calculator className="h-4 w-4" />
              Simpan Perubahan
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <p className="text-xs text-muted-foreground">Aturan per Kategori</p>
          <p className="text-lg font-semibold text-foreground">
            {summary.byCategory}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <p className="text-xs text-muted-foreground">Aturan per SKU</p>
          <p className="text-lg font-semibold text-foreground">{summary.bySku}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <p className="text-xs text-muted-foreground">Rata-rata Harga Jual</p>
          <p
            className="text-lg font-semibold text-foreground"
            style={NUMERIC_MONO}
          >
            {formatRupiah(summary.avgFinal)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[120px]">Scope</TableHead>
              <TableHead className="w-[160px]">Target</TableHead>
              <TableHead className="w-[170px] text-right">Harga Modal</TableHead>
              <TableHead className="w-[170px]">Margin Type</TableHead>
              <TableHead className="w-[150px]">Margin Value</TableHead>
              <TableHead className="w-[180px] text-right">
                Harga Jual Final
              </TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => {
              const finalPrice = computeFinalPrice(
                rule.basePriceAvg,
                rule.marginType,
                rule.marginValue,
              )
              const delta = finalPrice - rule.basePriceAvg
              const deltaPct =
                rule.basePriceAvg > 0
                  ? ((delta / rule.basePriceAvg) * 100).toFixed(1)
                  : '0.0'
              return (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge
                      variant={rule.scope === 'category' ? 'default' : 'secondary'}
                      className="font-mono text-[10px] uppercase tracking-wide"
                    >
                      {rule.scope}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-xs font-semibold text-foreground"
                      style={NUMERIC_MONO}
                    >
                      {rule.target}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right font-mono tabular-nums text-muted-foreground"
                    style={NUMERIC_MONO}
                  >
                    {formatRupiah(rule.basePriceAvg)}
                  </TableCell>
                  <TableCell>
                    <MarginTypeSelect
                      value={rule.marginType}
                      onChange={(next) =>
                        updateRule(rule.id, { marginType: next })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={rule.marginValue}
                      onChange={(e) =>
                        updateRule(rule.id, {
                          marginValue: Number(e.target.value) || 0,
                        })
                      }
                      className="font-mono tabular-nums"
                      style={NUMERIC_MONO}
                      aria-label={`Margin value untuk ${rule.target}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="font-mono text-sm font-bold tabular-nums text-foreground"
                      style={NUMERIC_MONO}
                    >
                      {formatRupiah(finalPrice)}
                    </div>
                    <div className="text-[11px] text-emerald-600">
                      +{formatRupiah(delta)} ({deltaPct}%)
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resetRule(rule.id)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Catatan: Harga Jual Final di-snapshot di server saat order dibuat. Perubahan margin tidak
        memengaruhi transaksi yang sudah berjalan.
      </p>
    </div>
  )
}
