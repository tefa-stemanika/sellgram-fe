'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Store, User, Package, LogOut, LogIn, UserPlus, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PortalAuthProvider, usePortalAuth } from './_components/portal-auth-provider'

function getInitials(name: string): string {
  return name
    .replace(/\p{Emoji}/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function StoreNavbar() {
  const params = useParams<{ userId: string }>()
  const pathname = usePathname()
  const { customer, isLoading, logout } = usePortalAuth()

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
  const isProfilePage = pathname.includes('/profile')

  if (isAuthPage) return null

  return (
    <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          {isProfilePage && (
            <Link
              href={`/store/${params.userId}`}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronLeft className="size-5" />
            </Link>
          )}
          <Link
            href={`/store/${params.userId}`}
            className="flex items-center gap-2 text-small-header font-semibold text-foreground"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
              <Store className="size-3.5" />
            </div>
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-8 w-20 rounded-lg" />
          ) : customer ? (
            <>
              <Link
                href={`/store/${params.userId}/profile/orders`}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-3 text-caption font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname.includes('/profile/orders') && 'bg-accent text-accent-foreground'
                )}
              >
                <Package className="size-3.5" />
                <span className="hidden sm:inline">Pesanan</span>
              </Link>
              <Link
                href={`/store/${params.userId}/profile`}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-lg px-3 text-caption font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === `/store/${params.userId}/profile` && 'bg-accent text-accent-foreground'
                )}
              >
                <User className="size-3.5" />
                <span className="hidden sm:inline">{customer.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-error"
                onClick={logout}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Link
                href={`/store/${params.userId}/login`}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-caption font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogIn className="size-3.5" />
                <span>Masuk</span>
              </Link>
              <Link
                href={`/store/${params.userId}/register`}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-caption font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <UserPlus className="size-3.5" />
                <span>Daftar</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthProvider>
      <StoreNavbar />
      {children}
    </PortalAuthProvider>
  )
}
