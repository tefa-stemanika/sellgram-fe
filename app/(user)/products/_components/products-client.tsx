'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Store } from 'lucide-react'
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
}

export function ProductsClient({ token }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const isEditMode = Boolean(selectedProduct)

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        setProducts([])
        return
      }

      setIsInitialLoading(true)
      try {
        const latest = await getProducts(token)
        setProducts(latest)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat produk')
      } finally {
        setIsInitialLoading(false)
      }
    }

    void fetchInitialData()
  }, [token])

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
                <p className="text-sm text-muted-foreground">{products.length} produk terdaftar</p>
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
          <DataTable columns={columns} data={products} isLoading={isInitialLoading} />
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
              isLoading={isLoading}
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
        isLoading={isLoading}
        onConfirm={() => {
          void handleDelete()
        }}
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
