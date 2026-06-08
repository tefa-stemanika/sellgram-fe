'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { getPublicProduct, createOrder, type PublicProduct, type CreateOrderResponse } from '@/services/public'
import { usePortalAuth } from '../../_components/portal-auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatIDRCurrency } from '@/lib/utils'

type FormState = {
  customerName: string
  customerPhone: string
  quantity: string
}

export default function ProductDetailPage() {
  const params = useParams<{ userId: string; productId: string }>()
  const userId = params.userId
  const productId = params.productId

  const { customer } = usePortalAuth()

  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    customerName: customer?.name ?? '',
    customerPhone: customer?.phone ?? '',
    quantity: '1'
  })

  useEffect(() => {
    if (customer) {
      setForm(f => ({
        ...f,
        customerName: customer.name ?? '',
        customerPhone: customer.phone ?? ''
      }))
    }
  }, [customer])

  useEffect(() => {
    getPublicProduct(userId, productId)
      .then(setProduct)
      .catch(() => setError('Produk tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [userId, productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const name = form.customerName.trim()
    if (!name) {
      toast.error('Nama customer harus diisi')
      return
    }

    const qty = parseInt(form.quantity, 10)
    if (Number.isNaN(qty) || qty < 1) {
      toast.error('Jumlah minimal 1')
      return
    }

    setSubmitting(true)

    try {
      const result: CreateOrderResponse = await createOrder({
        userId,
        productId,
        quantity: qty,
        customerName: name,
        customerPhone: form.customerPhone.trim() || undefined
      })

      sessionStorage.setItem('store_userId', userId)
      window.location.href = result.paymentUrl
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="mb-8 h-6 w-32" />
        <Skeleton className="mb-6 h-52 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 text-7xl">(empty)</div>
          <h1 className="mb-3 text-section-header font-black text-foreground">Produk Tidak Ditemukan</h1>
          <p className="mb-8 text-body text-muted-foreground">Produk tidak tersedia atau telah dihapus.</p>
          <Link
            href={`/store/${userId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-label font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95">
            <ArrowLeft className="size-4" />
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href={`/store/${userId}`}
        className="group mb-8 inline-flex items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
        style={{ animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Kembali ke Katalog
      </Link>

      <div
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5"
        style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.05s' }}>
        <div className="relative bg-white/80 backdrop-blur-sm dark:bg-card/80 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex size-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-5xl shadow-inner">
              {product.emoji}
            </div>
            <h1 className="text-page-title font-black text-foreground">{product.name}</h1>
            {product.description && <p className="mt-2 max-w-md text-body text-muted-foreground">{product.description}</p>}
            <div className="mt-5 inline-block rounded-full bg-gradient-to-r from-primary to-primary/80 px-7 py-2.5 text-card-title font-bold text-primary-foreground shadow-md">
              {formatIDRCurrency(product.price)}
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-8 overflow-hidden rounded-2xl bg-card"
        style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.12s' }}>
        <div className="border-b border-border px-8 py-4">
          <h2 className="text-card-title font-bold text-foreground">Detail Pesanan</h2>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-label font-medium text-foreground">
                Nama Lengkap <span className="text-error">*</span>
              </label>
              <Input
                placeholder="Masukkan nama kamu"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                disabled={submitting}
                required
                className="h-12 rounded-xl border-border bg-background px-4 text-body"
              />
            </div>

            <div>
              <label className="mb-2 block text-label font-medium text-foreground">
                No. WhatsApp <span className="text-muted-foreground">(opsional)</span>
              </label>
              <Input
                placeholder="08xxxxxxxxxx"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                disabled={submitting}
                className="h-12 rounded-xl border-border bg-background px-4 text-body"
              />
            </div>

            <div>
              <label className="mb-2 block text-label font-medium text-foreground">Jumlah</label>
              <Input
                type="number"
                min={1}
                placeholder="1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                disabled={submitting}
                className="h-12 rounded-xl border-border bg-background px-4 text-body"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="xl"
                className="h-14 w-full gap-3 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-body font-bold shadow-md transition-all hover:from-primary/90 hover:to-primary/70 active:scale-[0.98] text-white"
                disabled={submitting}>
                <ShoppingBag className="size-5" />
                {submitting ? 'Memproses...' : 'Beli Sekarang'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center" style={{ animation: 'fadeIn 0.5s ease both', animationDelay: '0.25s' }}>
        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="mt-4 text-caption text-muted-foreground">
          Pembayaran diproses secara aman oleh{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-semibold text-transparent">
            Midtrans
          </span>
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
