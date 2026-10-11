'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Store } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputSearch from '@/components/core/input-search'
import { PageHeader } from '@/components/shared/page-header'
import { Surface } from '@/components/shared/surface'
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
import { FulfillmentConfigDialog } from './fulfillment-config-dialog'
import { getProductColumns } from './product-columns'
import { ProductForm } from './product-form'
import { StockDialog } from './stock-dialog'

type ProductsClientProps = {
  token: string
}

const AVAILABILITY_FILTERS = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Tersedia', value: 'true' },
  { label: 'Tidak tersedia', value: 'false' }
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
  const [isFulfillmentOpen, setIsFulfillmentOpen] = useState(false)
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
        },
        onManageFulfillment: (product) => {
          setSelectedProduct(product)
          setIsFulfillmentOpen(true)
        }
      }),
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Katalog"
        title="Produk"
        description="Kelola daftar produk untuk bot Anda."
        actions={
          <Button
            onClick={() => {
              setSelectedProduct(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah produk
          </Button>
        }
      />

      <Surface className="animate-fade-in-up p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputSearch
            placeholder="Cari produk..."
            defaultValue={search}
            onChangeValue={(value) => {
              setSearch(value)
              setPage(1)
            }}
            wrapperClassname="flex-1"
          />
          <Select
            value={availabilityFilter}
            onValueChange={(value) => {
              setAvailabilityFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
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
      </Surface>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyIcon={Store}
        emptyMessage="Belum ada produk."
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          totalLabel: 'produk'
        }}
      />

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setSelectedProduct(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit produk' : 'Tambah produk'}</DialogTitle>
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

      {selectedProduct && (
        <FulfillmentConfigDialog
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          open={isFulfillmentOpen}
          onOpenChange={(open) => {
            setIsFulfillmentOpen(open)
            if (!open) setSelectedProduct(null)
          }}
          token={token}
        />
      )}
    </div>
  )
}
