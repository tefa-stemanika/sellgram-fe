'use client'

import { useCallback, useEffect, useState } from 'react'
import { Archive, ClipboardList, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import {
  adjustStock,
  getStockLogs,
  restockProduct,
  type Product,
  type StockLog
} from '@/services/products'

type StockDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  onStockUpdated: () => void
}

export function StockDialog({ product, open, onOpenChange, token, onStockUpdated }: StockDialogProps) {
  const [restockQty, setRestockQty] = useState(1)
  const [restockNote, setRestockNote] = useState('')
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustNote, setAdjustNote] = useState('')
  const [isRestocking, setIsRestocking] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  const [logs, setLogs] = useState<StockLog[]>([])
  const [logsPage, setLogsPage] = useState(1)
  const [logsTotalPages, setLogsTotalPages] = useState(1)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const fetchLogs = useCallback(async () => {
    if (!product || !token) return

    setIsLoadingLogs(true)
    try {
      const result = await getStockLogs(token, product.id, { page: logsPage, limit: 10 })
      setLogs(result.data)
      setLogsTotalPages(result.meta.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat riwayat stok')
    } finally {
      setIsLoadingLogs(false)
    }
  }, [product, token, logsPage])

  useEffect(() => {
    if (open && product) {
      setRestockQty(1)
      setRestockNote('')
      setAdjustQty(0)
      setAdjustNote('')
      setLogsPage(1)
      void fetchLogs()
    }
  }, [open, product, fetchLogs])

  const handleRestock = async () => {
    if (!product || !token) return
    if (restockQty < 1) {
      toast.error('Jumlah restok minimal 1')
      return
    }

    setIsRestocking(true)
    try {
      await restockProduct(token, product.id, { quantity: restockQty, note: restockNote || undefined })
      toast.success('Stok berhasil ditambahkan')
      void fetchLogs()
      setRestockQty(1)
      setRestockNote('')
      onStockUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal restok')
    } finally {
      setIsRestocking(false)
    }
  }

  const handleAdjust = async () => {
    if (!product || !token) return
    if (adjustQty === 0) {
      toast.error('Jumlah penyesuaian tidak boleh 0')
      return
    }

    setIsAdjusting(true)
    try {
      await adjustStock(token, product.id, { quantity: adjustQty, note: adjustNote || undefined })
      toast.success('Stok berhasil disesuaikan')
      void fetchLogs()
      setAdjustQty(0)
      setAdjustNote('')
      onStockUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyesuaikan stok')
    } finally {
      setIsAdjusting(false)
    }
  }

  if (!product) return null

  const stockBadgeClass =
    product.stock <= 0
      ? 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300'
      : product.stock <= product.lowStockAlert
        ? 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
        : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-600" />
        <div className="bg-white p-6 dark:bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">{product.emoji}</span>
              <DialogTitle className="text-xl font-black tracking-tight">{product.name}</DialogTitle>
            </div>
            <DialogDescription>Kelola stok produk</DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-lg border bg-white p-4 dark:bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stok saat ini</p>
                {product.stockEnabled ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-black">{product.stock}</span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stockBadgeClass}`}>
                      {product.stock <= 0
                        ? 'Habis'
                        : product.stock <= product.lowStockAlert
                          ? 'Stok rendah'
                          : 'Tersedia'}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Stok tidak dilacak</p>
                )}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Batas rendah: {product.lowStockAlert}</p>
                <p>Oversell: {product.allowOversell ? 'Diizinkan' : 'Tidak'}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="restock" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="restock" className="gap-1.5">
                <PackagePlus className="h-3.5 w-3.5" />
                Restok
              </TabsTrigger>
              <TabsTrigger value="adjust" className="gap-1.5">
                <Archive className="h-3.5 w-3.5" />
                Sesuaikan
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                Riwayat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="restock" className="mt-4 space-y-4">
              <div>
                <Label htmlFor="restock-qty">Jumlah tambahan</Label>
                <Input
                  id="restock-qty"
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, Number(e.target.value)))}
                  className="mt-1 bg-white dark:bg-card"
                />
              </div>
              <div>
                <Label htmlFor="restock-note">Catatan (opsional)</Label>
                <Textarea
                  id="restock-note"
                  placeholder="Misal: Restok dari supplier"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="mt-1 min-h-[60px] bg-white dark:bg-card"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => void handleRestock()}
                disabled={isRestocking || restockQty < 1}>
                {isRestocking ? 'Merestok...' : `Tambah ${restockQty} stok`}
              </Button>
            </TabsContent>

            <TabsContent value="adjust" className="mt-4 space-y-4">
              <div>
                <Label htmlFor="adjust-qty">Jumlah perubahan</Label>
                <Input
                  id="adjust-qty"
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="mt-1 bg-white dark:bg-card"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Gunakan angka positif untuk menambah, negatif untuk mengurangi
                </p>
              </div>
              <div>
                <Label htmlFor="adjust-note">Catatan (opsional)</Label>
                <Textarea
                  id="adjust-note"
                  placeholder="Alasan penyesuaian"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="mt-1 min-h-[60px] bg-white dark:bg-card"
                />
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => void handleAdjust()}
                disabled={isAdjusting || adjustQty === 0}>
                {isAdjusting ? 'Menyesuaikan...' : `Sesuaikan stok`}
              </Button>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              {isLoadingLogs && logs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Memuat riwayat...</p>
              ) : logs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada riwayat stok.</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-lg border bg-white p-3 dark:bg-card">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              log.type === 'RESTOCK'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : log.type === 'SALE'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}>
                            {log.type === 'RESTOCK' ? 'Restok' : log.type === 'SALE' ? 'Penjualan' : 'Penyesuaian'}
                          </span>
                          <span className="font-mono text-sm font-semibold">
                            {log.delta > 0 ? `+${log.delta}` : log.delta}
                          </span>
                        </div>
                        {log.note && <p className="mt-0.5 text-xs text-muted-foreground">{log.note}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          Sisa: {log.stockAfter}
                        </p>
                      </div>
                    </div>
                  ))}

                  {logsTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        Halaman {logsPage} dari {logsTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={logsPage <= 1}
                          onClick={() => setLogsPage((p) => Math.max(1, p - 1))}>
                          Sebelumnya
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={logsPage >= logsTotalPages}
                          onClick={() => setLogsPage((p) => p + 1)}>
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
