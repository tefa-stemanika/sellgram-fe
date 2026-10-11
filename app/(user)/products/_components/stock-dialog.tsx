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
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { formatDate } from '@/lib/utils'
import { adjustStock, getStockLogs, restockProduct, type Product, type StockLog } from '@/services/products'

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

  const stockKey = product.stock <= 0 ? 'OUT' : product.stock <= product.lowStockAlert ? 'LOW' : 'AVAILABLE'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-subsection-header leading-none">{product.emoji}</span>
            <DialogTitle>{product.name}</DialogTitle>
          </div>
          <DialogDescription>Kelola stok produk</DialogDescription>
        </DialogHeader>

        <Surface className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm text-muted-foreground">Stok saat ini</p>
              {product.stockEnabled ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-mono-data font-mono tabular">{product.stock}</span>
                  <StatusBadge kind="stock" value={stockKey} />
                </div>
              ) : (
                <p className="mt-1 text-body-sm text-muted-foreground">Stok tidak dilacak</p>
              )}
            </div>
            <div className="text-right text-caption text-muted-foreground">
              <p>
                Batas rendah: <span className="font-mono tabular text-foreground">{product.lowStockAlert}</span>
              </p>
              <p>Oversell: {product.allowOversell ? 'Diizinkan' : 'Tidak'}</p>
            </div>
          </div>
        </Surface>

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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="restock-note">Catatan (opsional)</Label>
              <Textarea
                id="restock-note"
                placeholder="Misal: Restok dari supplier"
                value={restockNote}
                onChange={(e) => setRestockNote(e.target.value)}
                className="mt-1 min-h-[60px]"
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => void handleRestock()}
              disabled={isRestocking || restockQty < 1}
            >
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
                className="mt-1"
              />
              <p className="mt-1 text-caption text-muted-foreground">
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
                className="mt-1 min-h-[60px]"
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => void handleAdjust()}
              disabled={isAdjusting || adjustQty === 0}
            >
              {isAdjusting ? 'Menyesuaikan...' : `Sesuaikan stok`}
            </Button>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            {isLoadingLogs && logs.length === 0 ? (
              <p className="py-8 text-center text-body-sm text-muted-foreground">Memuat riwayat...</p>
            ) : logs.length === 0 ? (
              <p className="py-8 text-center text-body-sm text-muted-foreground">Belum ada riwayat stok.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <Surface key={log.id} className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-caption font-medium text-muted-foreground">
                          {log.type === 'RESTOCK' ? 'Restok' : log.type === 'SALE' ? 'Penjualan' : 'Penyesuaian'}
                        </span>
                        <span
                          className={`text-mono-data font-mono tabular ${
                            log.delta > 0 ? 'text-success' : log.delta < 0 ? 'text-error' : 'text-muted-foreground'
                          }`}
                        >
                          {log.delta > 0 ? `+${log.delta}` : log.delta}
                        </span>
                      </div>
                      {log.note && <p className="mt-0.5 text-caption text-muted-foreground">{log.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-caption text-muted-foreground">{formatDate(log.createdAt)}</p>
                      <p className="font-mono text-caption text-muted-foreground">
                        Sisa: <span className="tabular text-foreground">{log.stockAfter}</span>
                      </p>
                    </div>
                  </Surface>
                ))}

                <DataTablePagination
                  page={logsPage}
                  totalPages={logsTotalPages}
                  onPageChange={setLogsPage}
                  totalLabel="riwayat"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
