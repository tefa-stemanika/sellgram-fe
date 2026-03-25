'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

type ProductsClientProps = {
  token: string
  initialData: Product[]
}

export function ProductsClient({ token, initialData }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const isEditMode = Boolean(selectedProduct)

  const refreshProducts = async () => {
    if (!token) return
    const latest = await getProducts(token)
    setProducts(latest)
  }

  const handleCreate = async (payload: CreateProductPayload) => {
    if (!token) return

    setIsLoading(true)
    try {
      await createProduct(token, payload)
      await refreshProducts()
      toast.success('Produk berhasil ditambahkan')
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambah produk')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (payload: UpdateProductPayload) => {
    if (!token || !selectedProduct) return

    setIsLoading(true)
    try {
      await updateProduct(token, selectedProduct.id, payload)
      await refreshProducts()
      toast.success('Produk berhasil diperbarui')
      setSelectedProduct(null)
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui produk')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !selectedProduct) return

    setIsLoading(true)
    try {
      await deleteProduct(token, selectedProduct.id)
      await refreshProducts()
      toast.success('Produk berhasil dihapus')
      setSelectedProduct(null)
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus produk')
    } finally {
      setIsLoading(false)
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
        }
      }),
    []
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Produk</h1>
            <p className="text-sm text-muted-foreground">Kelola daftar produk untuk bot Anda.</p>
          </div>
          <Button
            className="shadow-sm"
            onClick={() => {
              setSelectedProduct(null)
              setIsFormOpen(true)
            }}>
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
        <DataTable columns={columns} data={products} />
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setSelectedProduct(null)
          }
        }}>
        <DialogContent className="border-border/70 bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Perbarui informasi produk Anda.' : 'Masukkan detail produk baru.'}
            </DialogDescription>
          </DialogHeader>

          <ProductForm
            mode={isEditMode ? 'update' : 'create'}
            defaultValues={selectedProduct ?? undefined}
            isLoading={isLoading}
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
        isLoading={isLoading}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </div>
  )
}
