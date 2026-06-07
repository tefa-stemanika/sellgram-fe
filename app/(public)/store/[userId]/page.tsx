'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Store, ShoppingBag } from 'lucide-react'
import { getStoreProfile, getPublicProducts, type StoreProfile, type PublicProduct } from '@/services/public'
import { formatIDRCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

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
        <Skeleton className="mx-auto mb-12 h-48 w-full max-w-xl rounded-2xl" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-card">
              <div className="flex flex-col items-center p-8">
                <Skeleton className="mb-4 size-20 rounded-2xl" />
                <Skeleton className="mb-2 h-5 w-28" />
                <Skeleton className="mb-2 h-4 w-40" />
                <Skeleton className="mt-2 h-7 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Store className="size-8 text-primary" />
            </div>
          </div>
          <h1 className="mb-3 text-section-header font-black text-foreground">
            Toko Tidak Ditemukan
          </h1>
          <p className="mx-auto max-w-sm text-body text-muted-foreground">
            Tautan toko tidak valid atau toko sudah tidak aktif.
          </p>
          <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
      </div>
    )
  }

  const heroLogo = getHeroLogo(profile!.name)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div
        className="relative mb-14 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-1"
        style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div className="relative rounded-xl bg-white/70 backdrop-blur-xl px-8 py-10 text-center dark:bg-card/80">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
            {heroLogo.type === 'emoji' ? (
              <span className="text-4xl">{heroLogo.value}</span>
            ) : (
              <span className="text-2xl font-black tracking-tight text-white">{heroLogo.value}</span>
            )}
          </div>
          <h1 className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-4xl font-black tracking-tight text-transparent animate-gradient-shift">
            {profile!.name}
          </h1>
          <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <p className="mt-4 text-body text-muted-foreground">
            Pilih produk favorit kamu dan pesan langsung lewat website
          </p>
        </div>
      </div>

      {availableProducts.length === 0 ? (
        <div
          className="py-20 text-center"
          style={{ animation: 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both', animationDelay: '0.15s' }}
        >
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="size-10 text-primary/60" />
          </div>
          <h2 className="mb-2 text-section-header font-bold text-foreground">
            Belum Ada Produk
          </h2>
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
              className="group block"
              style={{
                animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
                animationDelay: `${0.1 + i * 0.06}s`
              }}
            >
              <div className="group/card relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-secondary/0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                <div className="relative flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-4xl transition-all duration-300 group-hover/card:scale-110 group-hover/card:from-primary/25 group-hover/card:to-secondary/25">
                    {product.emoji}
                  </div>
                  <h3 className="text-card-title font-bold text-foreground">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mt-1.5 line-clamp-2 text-body-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-4 inline-block rounded-full bg-gradient-to-r from-primary to-primary/80 px-5 py-1.5 text-label font-bold text-primary-foreground shadow-sm">
                    {formatIDRCurrency(product.price)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div
        className="mt-16 text-center"
        style={{ animation: 'fadeIn 0.5s ease both', animationDelay: '0.5s' }}
      >
        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="mt-4 text-caption text-muted-foreground">
          Powered by{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-semibold text-transparent">
            Sellgram
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
