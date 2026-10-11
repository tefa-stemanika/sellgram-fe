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
import { Surface } from '@/components/shared/surface'
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
        <Skeleton className="mb-6 h-52 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 text-7xl font-semibold text-muted-foreground">(empty)</div>
          <h1 className="mb-3 text-section-header font-semibold text-foreground">Produk tidak ditemukan</h1>
          <p className="mb-8 text-body text-muted-foreground">Produk tidak tersedia atau telah dihapus.</p>
          <Button asChild size="xl">
            <Link href={`/store/${userId}`}>
              <ArrowLeft className="size-4" />
              Kembali ke katalog
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href={`/store/${userId}`}
        className="group mb-8 inline-flex animate-fade-in-up items-center gap-1.5 text-body-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Kembali ke Katalog
      </Link>

      <Surface elevation={1} className="animate-fade-in-up p-8 text-center" style={{ animationDelay: '0.05s' }}>
        <div className="mx-auto mb-5 flex size-28 items-center justify-center rounded-lg bg-muted text-5xl">
          {product.emoji}
        </div>
        <h1 className="text-page-title font-semibold text-foreground">{product.name}</h1>
        {product.description && <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">{product.description}</p>}
        <div className="mt-5 inline-block rounded-full border border-primary/25 bg-primary/10 px-6 py-1.5 font-mono text-card-title font-semibold tabular text-primary">
          {formatIDRCurrency(product.price)}
        </div>
      </Surface>

      <Surface elevation={1} className="mt-8 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.12s' }}>
        <div className="border-b border-border px-8 py-4">
          <h2 className="text-card-title font-semibold text-foreground">Detail pesanan</h2>
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
                className="text-body"
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
                className="text-body"
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
                className="text-body font-mono tabular"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={submitting}>
                <ShoppingBag className="size-5" />
                {submitting ? 'Memproses...' : 'Beli Sekarang'}
              </Button>
            </div>
          </form>
        </div>
      </Surface>

      <div className="mt-8 animate-fade-in-up text-center" style={{ animationDelay: '0.25s' }}>
        <div className="mx-auto h-px w-32 bg-border" />
        <p className="mt-4 text-caption text-muted-foreground">
          Pembayaran diproses secara aman oleh{' '}
          <span className="font-semibold text-foreground">Midtrans</span>
        </p>
      </div>
    </div>
  )
}
