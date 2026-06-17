'use client'

import { useMemo, useRef, useState } from 'react'
import {
  RefreshCw,
  Search,
  Package,
  X,
  Plus,
  Upload,
  Download,
  Trash2,
  Pencil,
  Check,
  FileSpreadsheet,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminPageHeader } from '@/components/features/admin-page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { syncDigiflazzAction } from '@/actions/products'

const CATEGORY_OPTIONS: ProductCategory[] = ['Pulsa', 'Data', 'Game']
const CATEGORY_BADGE: Record<ProductCategory, string> = {
  Pulsa: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  Data: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  Game: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20',
}

interface ProductForm {
  sku: string
  name: string
  category: ProductCategory
  basePrice: number
  isActive: boolean
}

const emptyForm: ProductForm = {
  sku: '',
  name: '',
  category: 'Pulsa',
  basePrice: 0,
  isActive: true,
}

/**
 * Parse CSV/XLSX content into AdminProduct[].
 * Template columns: No, Kode Produk, Produk, Seller, Harga, Harga Max, Stok, Status, Perubahan Terakhir, Deskripsi
 * Maps Kode Produk→sku, Produk→name, Harga→basePrice, Status→isActive
 */
function parseImportedFile(
  rows: Record<string, string | number>[],
): AdminProduct[] {
  return rows
    .filter((r) => r['Kode Produk'] && r['Harga'])
    .map((r) => {
      const sku = String(r['Kode Produk']).trim()
      const name = String(r['Produk']).trim()
      const price = Number(r['Harga'])
      const status = String(r['Status'] ?? '').toLowerCase()
      const desc = String(r['Deskripsi'] ?? '').toLowerCase()

      // Guess category from name/desc keywords
      let category: ProductCategory = 'Pulsa'
      if (/game|diamond|crystal|uc|vp|shard|pass|membership|genshin|mobile legends|free fire|pubg|valorant|honkai/i.test(name + ' ' + desc)) {
        category = 'Game'
      } else if (/data|gb|mb|internet|paket/i.test(name + ' ' + desc)) {
        category = 'Data'
      } else if (/gopay|ovo|dana|shopeepay|linkaja|e-money|saldo|emoney/i.test(name + ' ' + desc)) {
        // E-Money not in DB enum; map to Data as fallback
        category = 'Data'
      } else if (/pln|token|listrik/i.test(name + ' ' + desc)) {
        category = 'Pulsa'
      }

      return {
        sku,
        name,
        category,
        basePrice: price,
        isActive: status === 'aktif',
      }
    })
}

export default function AdminProdukPage() {
  const [items, setItems] = useState<AdminProduct[]>(seedProducts)
  const [query, setQuery] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editSku, setEditSku] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [importing, setImporting] = useState(false)
  const [previewRows, setPreviewRows] = useState<AdminProduct[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [items, query])

  const activeCount = items.filter((p) => p.isActive).length

  // ── Toggle active ──
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

  // ── Delete ──
  function deleteProduct(sku: string) {
    const product = items.find((p) => p.sku === sku)
    if (!product) return
    setItems((prev) => prev.filter((p) => p.sku !== sku))
    toast.success('Produk dihapus', { description: product.name })
  }

  // ── Add / Edit ──
  function openAdd() {
    setEditSku(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }
  function openEdit(product: AdminProduct) {
    setEditSku(product.sku)
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      basePrice: product.basePrice,
      isActive: product.isActive,
    })
    setShowForm(true)
  }
  function saveForm() {
    if (!form.sku.trim() || !form.name.trim() || form.basePrice <= 0) {
      toast.error('Form tidak valid', {
        description: 'SKU, Nama, dan Harga harus terisi.',
      })
      return
    }
    if (editSku) {
      // Update existing
      setItems((prev) =>
        prev.map((p) =>
          p.sku === editSku
            ? {
                ...p,
                name: form.name.trim(),
                category: form.category,
                basePrice: form.basePrice,
                isActive: form.isActive,
              }
            : p,
        ),
      )
      toast.success('Produk diperbarui', { description: form.name })
    } else {
      // Add new
      if (items.some((p) => p.sku === form.sku.trim())) {
        toast.error('SKU sudah ada', { description: form.sku })
        return
      }
      setItems((prev) => [
        ...prev,
        {
          sku: form.sku.trim(),
          name: form.name.trim(),
          category: form.category,
          basePrice: form.basePrice,
          isActive: form.isActive,
        },
      ])
      toast.success('Produk ditambahkan', { description: form.name })
    }
    setShowForm(false)
  }

  // ── CSV/XLSX Import ──
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)

    const reader = new FileReader()
    reader.onload = (evt) => {
      parseImportFile(file, evt.target?.result ?? null)
    }
    reader.readAsArrayBuffer(file)
  }

  async function parseImportFile(file: File, data: string | ArrayBuffer | null | undefined) {
    try {
      if (!data) return

      let rows: Record<string, string | number>[] = []

      if (file.name.endsWith('.csv')) {
        // Parse CSV with PapaParse
        const Papa = (await import('papaparse')).default
        const result = Papa.parse(data as string, {
          header: true,
          skipEmptyLines: true,
        })
        rows = result.data as Record<string, string | number>[]
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Parse XLSX with SheetJS
        const XLSX = await import('xlsx')
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        rows = XLSX.utils.sheet_to_json(ws) as Record<string, string | number>[]
      } else {
        toast.error('Format file tidak didukung', {
          description: 'Gunakan .csv atau .xlsx',
        })
        setImporting(false)
        return
      }

      const products = parseImportedFile(rows)
      if (products.length === 0) {
        toast.error('Tidak ada data ditemukan', {
          description: 'Pastikan file memiliki kolom: Kode Produk, Produk, Harga, Status',
        })
        setImporting(false)
        return
      }

      setPreviewRows(products)
      toast.success(`${products.length} produk ditemukan di file`, {
        description: 'Review dan klik "Import" untuk menambahkan.',
      })
    } catch (err) {
      console.error('Parse error', err)
      toast.error('Gagal membaca file', { description: 'Format tidak sesuai template.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function confirmImport() {
    if (!previewRows) return
    let added = 0
    let skipped = 0
    const existing = new Set(items.map((p) => p.sku))
    const newItems = [...items]

    for (const product of previewRows) {
      if (existing.has(product.sku)) {
        skipped++
        continue
      }
      newItems.push(product)
      added++
    }

    setItems(newItems)
    setPreviewRows(null)
    toast.success(`${added} produk diimport`, {
      description: skipped > 0 ? `${skipped} SKU duplikat dilewati.` : undefined,
    })
  }

  // ── Digiflazz sync ──
  async function runSync() {
    setSyncing(true)
    toast.info('Memulai sync Digiflazz', {
      description: 'Mengambil SKU terbaru dari gateway…',
    })
    try {
      const res = await syncDigiflazzAction()
      if (res.success && res.data) {
        toast.success('Sync selesai', {
          description: `${res.data.total} produk berhasil diperbarui.`,
        })
      } else {
        toast.error('Sync gagal', {
          description: res.error ?? 'Periksa kredensial Digiflazz di .env',
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Sync gagal', { description: 'Kesalahan tak terduga' })
    } finally {
      setSyncing(false)
    }
  }

  // ── Export CSV ──
  function exportCSV() {
    const header = ['SKU', 'Nama', 'Kategori', 'Harga Modal', 'Status']
    const rows = items.map((p) => [
      p.sku,
      p.name,
      p.category,
      String(p.basePrice),
      p.isActive ? 'Aktif' : 'Nonaktif',
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `produk-adnanpay-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV diunduh')
  }

  return (
    <div>
      <AdminPageHeader
        title="Manajemen Produk"
        description="Kelola produk, tambah/edit manual, atau import dari CSV/XLSX."
        icon={Package}
        actions={
          <div className="flex gap-2">
            <Button onClick={openAdd} size="sm">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import CSV/XLSX
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={runSync} disabled={syncing} variant="default" size="sm">
              <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
              {syncing ? 'Syncing…' : 'Sync Digiflazz'}
            </Button>
          </div>
        }
      />

      {/* Import Preview */}
      {previewRows && (
        <div className="mb-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-800">
              Preview Import — {previewRows.length} produk
            </span>
          </div>
          <div className="mb-3 max-h-48 overflow-auto rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Aktif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.slice(0, 20).map((p) => (
                  <TableRow key={p.sku}>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={CATEGORY_BADGE[p.category]}>
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatRupiah(p.basePrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.isActive ? '✅' : '❌'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmImport} size="sm">
              <Check className="h-4 w-4" />
              Import {previewRows.length} Produk
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewRows(null)}>
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
          <h3 className="mb-4 font-semibold text-emerald-900">
            {editSku ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label className="text-xs font-semibold">SKU *</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="TEL10"
                disabled={!!editSku}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Nama Produk *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Telkomsel 10.000"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Kategori</Label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ProductCategory })
                }
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Harga Modal *</Label>
              <Input
                type="number"
                value={form.basePrice || ''}
                onChange={(e) =>
                  setForm({ ...form, basePrice: Number(e.target.value) })
                }
                placeholder="10000"
                min={0}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={saveForm} size="sm">
                <Check className="h-4 w-4" />
                {editSku ? 'Update' : 'Simpan'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search + Stats */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari SKU, nama, atau kategori…"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{activeCount}</span> dari{' '}
          {items.length} produk aktif
          {query && (
            <>
              {' · '}
              <span className="font-medium text-foreground">{filtered.length}</span> cocok
            </>
          )}
        </p>
      </div>

      {/* Product Table */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[120px]">SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead className="w-[100px]">Kategori</TableHead>
              <TableHead className="w-[140px] text-right">Harga Modal</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="w-[80px] text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Tidak ada produk{query ? ` yang cocok dengan "${query}"` : ''}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.sku} className="group">
                  <TableCell>
                    <span
                      className="font-mono text-xs font-semibold tracking-wide text-foreground"
                      style={{ fontFamily: 'var(--font-mono-jb), ui-monospace, monospace' }}
                    >
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border font-medium', CATEGORY_BADGE[product.category])}>
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-right font-mono tabular-nums text-foreground"
                    style={{ fontFamily: 'var(--font-mono-jb), ui-monospace, monospace' }}
                  >
                    {formatRupiah(product.basePrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={(next) => toggleActive(product.sku, next)}
                        aria-label={`Toggle ${product.name}`}
                      />
                      <span className={cn('text-xs font-medium', product.isActive ? 'text-emerald-600' : 'text-muted-foreground')}>
                        {product.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(product)}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteProduct(product.sku)}
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
