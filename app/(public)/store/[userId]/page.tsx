'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Store, ShoppingBag } from 'lucide-react'
import { getStoreProfile, getPublicProducts, type StoreProfile, type PublicProduct } from '@/services/public'
import { formatIDRCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Surface } from '@/components/shared/surface'

function getInitials(name: string): string {
  return name
    .replace(/\p{Emoji}/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getHeroLogo(name: string): { type: 'emoji' | 'initials'; value: string } {
  const emojis = name
    .split('')
    .filter((c) => /\p{Emoji}/u.test(c))
  if (emojis.length > 0) {
    return { type: 'emoji', value: emojis[0] }
  }
  return { type: 'initials', value: getInitials(name) }
}

export default function CatalogPage() {
  const params = useParams<{ userId: string }>()
  const userId = params.userId

  const [profile, setProfile] = useState<StoreProfile | null>(null)
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      getStoreProfile(userId).catch(() => null),
      getPublicProducts(userId).catch(() => [])
    ])
      .then(([prof, prods]) => {
        if (!prof) {
          setError(true)
          return
        }
        setProfile(prof)
        setProducts(prods)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  const availableProducts = products.filter((p) => p.isAvailable)

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Skeleton className="mx-auto mb-12 h-48 w-full max-w-xl rounded-lg" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Surface key={i} className="flex flex-col items-center p-8">
              <Skeleton className="mb-4 size-20 rounded-lg" />
              <Skeleton className="mb-2 h-5 w-28" />
              <Skeleton className="mb-2 h-4 w-40" />
              <Skeleton className="mt-2 h-7 w-24 rounded-full" />
            </Surface>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-lg bg-muted">
            <Store className="size-8 text-primary" />
          </div>
          <h1 className="mb-3 text-section-header font-semibold text-foreground">Toko tidak ditemukan</h1>
          <p className="mx-auto max-w-sm text-body text-muted-foreground">
            Tautan toko tidak valid atau toko sudah tidak aktif.
          </p>
        </div>
      </div>
    )
  }

  const heroLogo = getHeroLogo(profile!.name)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Surface elevation={1} className="mb-14 animate-fade-in-up px-8 py-10 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-lg bg-primary shadow-l1">
          {heroLogo.type === 'emoji' ? (
            <span className="text-4xl">{heroLogo.value}</span>
          ) : (
            <span className="text-2xl font-semibold tracking-tight text-primary-foreground">{heroLogo.value}</span>
          )}
        </div>
        <h1 className="text-page-title font-semibold tracking-tight text-foreground">{profile!.name}</h1>
        <p className="mt-4 text-body text-muted-foreground">
          Pilih produk favorit kamu dan pesan langsung lewat website
        </p>
      </Surface>

      {availableProducts.length === 0 ? (
        <div className="animate-fade-in-up py-20 text-center" style={{ animationDelay: '0.15s' }}>
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="size-10 text-primary/60" />
          </div>
          <h2 className="mb-2 text-section-header font-semibold text-foreground">Belum ada produk</h2>
          <p className="text-body text-muted-foreground">
            Belum ada produk tersedia saat ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {availableProducts.map((product, i) => (
            <Link
              key={product.id}
              href={`/store/${userId}/product/${product.id}`}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${0.1 + i * 0.06}s` }}
            >
              <div className="relative flex flex-col items-center overflow-hidden rounded-lg border border-border bg-card p-8 text-center shadow-l1 transition-shadow duration-200 hover:shadow-l2">
                <div className="mb-4 flex size-24 items-center justify-center rounded-lg bg-muted text-4xl">
                  {product.emoji}
                </div>
                <h3 className="text-card-title font-semibold text-foreground">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-1.5 line-clamp-2 text-body-sm text-muted-foreground">
                    {product.description}
                  </p>
                )}
                <div className="mt-4 inline-block rounded-full border border-primary/25 bg-primary/10 px-4 py-1 font-mono text-label font-semibold tabular text-primary">
                  {formatIDRCurrency(product.price)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-16 animate-fade-in-up text-center" style={{ animationDelay: '0.5s' }}>
        <div className="mx-auto h-px w-32 bg-border" />
        <p className="mt-4 text-caption text-muted-foreground">
          Powered by{' '}
          <span className="font-semibold text-foreground">Sellgram</span>
        </p>
      </div>
    </div>
  )
}
