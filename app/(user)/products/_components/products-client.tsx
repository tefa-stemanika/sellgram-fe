'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Store } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputSearch from '@/components/core/input-search'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type CreateProductPayload,
  type Product,
  type UpdateProductPayload
} from '@/services/products'

import { DataTable } from '../../_components/data-table'
import { DeleteProductDialog } from './delete-product-dialog'
import { getProductColumns } from './product-columns'
import { ProductForm } from './product-form'
import { StockDialog } from './stock-dialog'

type ProductsClientProps = {
  token: string
}

const AVAILABILITY_FILTERS = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Tersedia', value: 'true' },
  { label: 'Tidak tersedia', value: 'false' },
]

export function ProductsClient({ token }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isStockOpen, setIsStockOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const isEditMode = Boolean(selectedProduct)

  const fetchProducts = useCallback(async () => {
    if (!token) {
      setProducts([])
      return
    }

    setIsLoading(true)
    try {
      const result = await getProducts(token, {
        page,
        limit: 20,
        search: search || undefined,
        isAvailable: availabilityFilter === 'ALL' ? undefined : availabilityFilter
      })
      setProducts(result.data)
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat produk')
    } finally {
      setIsLoading(false)
    }
  }, [token, page, search, availabilityFilter])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const handleCreate = async (payload: CreateProductPayload) => {
    if (!token) return

    setIsSaving(true)
    try {
      await createProduct(token, payload)
      toast.success('Produk berhasil ditambahkan')
      setIsFormOpen(false)
      setPage(1)
      void fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambah produk')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (payload: UpdateProductPayload) => {
    if (!token || !selectedProduct) return

    setIsSaving(true)
    try {
      await updateProduct(token, selectedProduct.id, payload)
      toast.success('Produk berhasil diperbarui')
      setSelectedProduct(null)
      setIsFormOpen(false)
      void fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui produk')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !selectedProduct) return

    setIsSaving(true)
    try {
      await deleteProduct(token, selectedProduct.id)
      toast.success('Produk berhasil dihapus')
      setSelectedProduct(null)
      setIsDeleteOpen(false)
      void fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus produk')
    } finally {
      setIsSaving(false)
    }
  }

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: (product) => {
          setSelectedProduct(product)
          setIsFormOpen(true)
        },
        onDelete: (product) => {
          setSelectedProduct(product)
          setIsDeleteOpen(true)
        },
        onManageStock: (product) => {
          setSelectedProduct(product)
          setIsStockOpen(true)
        }
      }),
    []
  )

  return (
    <div className="space-y-6">
      <header
        className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Produk
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Daftar{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Produk
          </span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kelola daftar produk untuk bot Anda.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.1s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="bg-white p-5 dark:bg-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Produk</h2>
                <p className="text-sm text-muted-foreground">{total} produk terdaftar</p>
              </div>
            </div>
            <Button
              className="shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => {
                setSelectedProduct(null)
                setIsFormOpen(true)
              }}>
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.15s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-600" />
        <div className="bg-white p-4 dark:bg-card">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputSearch
              placeholder="Cari produk..."
              defaultValue={search}
              onChangeValue={(value) => {
                setSearch(value)
                setPage(1)
              }}
              wrapperClassname="flex-1"
              className="bg-white dark:bg-card"
            />
            <Select
              value={availabilityFilter}
              onValueChange={(value) => {
                setAvailabilityFilter(value)
                setPage(1)
              }}>
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-44 transition-all duration-200">
                <SelectValue placeholder="Filter ketersediaan" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={columns} data={products} isLoading={isLoading} emptyIcon={Store} emptyMessage="Belum ada produk." />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setSelectedProduct(null)
          }
        }}>
        <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-lg">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="bg-white p-6 dark:bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">
                {isEditMode ? 'Edit Produk' : 'Tambah Produk'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Perbarui informasi produk Anda.' : 'Masukkan detail produk baru.'}
              </DialogDescription>
            </DialogHeader>

            <ProductForm
              mode={isEditMode ? 'update' : 'create'}
              defaultValues={selectedProduct ?? undefined}
              isLoading={isSaving}
              onSubmit={(values) => {
                if (isEditMode) {
                  void handleUpdate(values as UpdateProductPayload)
                  return
                }
                void handleCreate(values as CreateProductPayload)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteProductDialog
        product={selectedProduct}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        isLoading={isSaving}
        onConfirm={() => {
          void handleDelete()
        }}
      />

      <StockDialog
        product={selectedProduct}
        open={isStockOpen}
        onOpenChange={setIsStockOpen}
        token={token}
        onStockUpdated={() => void fetchProducts()}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
