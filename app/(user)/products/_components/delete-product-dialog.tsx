'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import type { Product } from '@/services/products'

type DeleteProductDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="overflow-hidden border-0 p-0 shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="bg-white/30 p-6 backdrop-blur-xl dark:bg-white/5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight">
              Hapus produk?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Produk <strong>{product?.name ?? 'ini'}</strong> akan dinonaktifkan dan tidak tampil di bot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
              onClick={onConfirm}
              disabled={isLoading}>
              {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
