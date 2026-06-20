'use client'

import { useEffect, useState } from 'react'
import { Activity, Boxes, Copy, Globe, HandCoins, MessageCircle, ShoppingCart, TicketCheck, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import { getDashboard, getQuota, type DashboardData, type QuotaData } from '@/services/dashboard'
import { getCurrentUser } from '@/services/user'

type DashboardOverviewProps = {
  token: string
}

const statusBadge: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  PAYMENT_PENDING: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  PAYMENT_FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300',
  CONFIRMED: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
  PROCESSING: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300'
}

export function DashboardOverview({ token }: DashboardOverviewProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [quota, setQuota] = useState<QuotaData | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setDashboard(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [data, q, user] = await Promise.all([
          getDashboard(token),
          getQuota(token),
          getCurrentUser(token)
        ])
        setDashboard(data)
        setQuota(q)
        setUserId(user.id)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat ringkasan dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [token])

  const metricCards = [
    {
      title: 'Produk Aktif',
      value: dashboard?.activeProducts ?? 0,
      icon: Boxes,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      badge: `${dashboard?.activeProducts ?? 0} total`
    },
    {
      title: 'Total Order',
      value: dashboard?.totalOrders ?? 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
      badge: 'total keseluruhan'
    },
    {
      title: 'Pending',
      value: dashboard?.pendingOrders ?? 0,
      icon: Activity,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
      badge: 'perlu tindakan'
    },
    {
      title: 'Pendapatan',
      value: formatIDRCurrency(dashboard?.totalRevenue ?? 0),
      icon: HandCoins,
      gradient: 'from-primary to-purple-600',
      iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
      badge: dashboard ? `+${dashboard.revenueGrowth}% pertumbuhan` : 'belum ada data'
    },
    {
      title: 'Tiket',
      value: dashboard?.tickets.total ?? 0,
      icon: TicketCheck,
      gradient: 'from-rose-500 to-pink-600',
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
      badge: dashboard ? `${dashboard.tickets.open} terbuka, ${dashboard.tickets.closed} tertutup` : 'belum ada data'
    }
  ]

  return (
    <div className="space-y-8">
      <header
        className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Dashboard
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Selamat Datang di{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Sellgram
          </span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pantau produk, order, dan performa pendapatan secara real-time.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-1.5 w-full bg-gradient-to-r from-slate-200 to-slate-300" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="mt-3 h-7 w-20" />
                  <Skeleton className="mt-2 h-3 w-16" />
                </CardContent>
              </Card>
            ))
          : metricCards.map((metric, i) => {
              const Icon = metric.icon

              return (
                <Card
                  key={metric.title}
                  className="group/card overflow-hidden border-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    animation: 'fadeInUp 0.4s ease both',
                    animationDelay: `${i * 80}ms`
                  }}>
                  <div className={`h-1.5 w-full bg-gradient-to-r ${metric.gradient}`} />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{metric.title}</span>
                      <div className={`rounded-lg ${metric.iconBg} p-2 transition-all duration-300 group-hover/card:scale-110`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight">{metric.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">{metric.badge}</p>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {!isLoading && dashboard && (
        <div
          className="grid gap-4 sm:grid-cols-2"
          style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.15s' }}>
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-600" />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="size-4" />
                Sumber Order
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-sky-600" />
                    <span className="text-sm font-medium">Website</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{dashboard.ordersBySource.WEBSITE}</span>
                    <span className="text-xs text-muted-foreground">
                      ({dashboard.totalOrders > 0
                        ? Math.round((dashboard.ordersBySource.WEBSITE / dashboard.totalOrders) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-4 text-emerald-600" />
                    <span className="text-sm font-medium">Telegram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{dashboard.ordersBySource.TELEGRAM}</span>
                    <span className="text-xs text-muted-foreground">
                      ({dashboard.totalOrders > 0
                        ? Math.round((dashboard.ordersBySource.TELEGRAM / dashboard.totalOrders) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-purple-600" />
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <HandCoins className="size-4" />
                Pendapatan per Sumber
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-sky-600" />
                    <span className="text-sm font-medium">Website</span>
                  </div>
                  <span className="text-lg font-bold">{formatIDRCurrency(dashboard.revenueBySource.WEBSITE)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-4 text-emerald-600" />
                    <span className="text-sm font-medium">Telegram</span>
                  </div>
                  <span className="text-lg font-bold">{formatIDRCurrency(dashboard.revenueBySource.TELEGRAM)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {userId && (
        <Card
          className="overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md"
          style={{
            animation: 'fadeInUp 0.4s ease both',
            animationDelay: '0.2s'
          }}>
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-600" />
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Tautan Toko Publik</p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {typeof window !== 'undefined' ? `${window.location.origin}/store/${userId}` : ''}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                Bagikan tautan ini agar customer bisa order lewat website
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/store/${userId}`
                  )
                  setLinkCopied(true)
                  toast.success('Tautan berhasil disalin')
                  setTimeout(() => setLinkCopied(false), 2000)
                }}
                disabled={linkCopied}
              >
                <Copy className="h-4 w-4" />
                {linkCopied ? 'Tersalin' : 'Salin Tautan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {quota && (
        <Card
          className="overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md"
          style={{
            animation: 'fadeInUp 0.4s ease both',
            animationDelay: '0.25s'
          }}>
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="size-4" />
              Pemakaian Paket <strong className="text-foreground">{quota.plan}</strong>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <QuotaBar
                label="Produk"
                used={quota.products.used}
                total={quota.products.total}
                gradient="from-emerald-500 to-emerald-600"
              />
              <QuotaBar
                label="Broadcast/bulan"
                used={quota.broadcastsPerMonth.used}
                total={quota.broadcastsPerMonth.total}
                gradient="from-blue-500 to-indigo-600"
              />
              <QuotaBar
                label="Order/bulan"
                used={quota.ordersPerMonth.used}
                total={quota.ordersPerMonth.total}
                gradient="from-amber-500 to-orange-600"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card
        className="overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{
          animation: 'fadeInUp 0.4s ease both',
          animationDelay: '0.35s'
        }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-bold">Order Terbaru</h2>
              <p className="text-sm text-muted-foreground">5 order terakhir yang masuk ke sistem.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <TrendingUp className="h-3 w-3" />
              {dashboard?.recentOrders.length ?? 0} order
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Order ID</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="pr-6">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                ))
              ) : dashboard?.recentOrders.length ? (
                dashboard.recentOrders.map((order, i) => (
                  <TableRow
                    key={order.id}
                    className="transition-colors hover:bg-muted/50"
                    style={{
                      animation: 'fadeInUp 0.3s ease both',
                      animationDelay: `${0.4 + i * 0.05}s`
                    }}>
                    <TableCell className="pl-6 font-mono text-xs font-medium">{order.orderId}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                          order.source === 'WEBSITE'
                            ? 'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/40 dark:text-sky-300'
                            : 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}>
                        {order.source === 'WEBSITE' ? <Globe className="size-3" /> : <MessageCircle className="size-3" />}
                        {order.source === 'WEBSITE' ? 'Web' : 'Tele'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.customerName ?? order.firstName ?? order.username ?? '-'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatIDRCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell className="pr-6 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                      <p>Belum ada order.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

function QuotaBar({
  label,
  used,
  total,
  gradient,
}: {
  label: string
  used: number
  total: number | 'Unlimited'
  gradient: string
}) {
  const isUnlimited = total === 'Unlimited'
  const pct = isUnlimited ? 100 : Math.min(Math.round((used / total) * 100), 100)

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {used}
          {isUnlimited ? '' : ` / ${total}`}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!isUnlimited && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">{pct}% terpakai</p>
      )}
    </div>
  )
}
