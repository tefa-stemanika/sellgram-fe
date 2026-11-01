'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Activity, Boxes, Copy, HandCoins, ShoppingCart, TicketCheck } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { OrderBuyerInfo } from '@/components/shared/order-buyer-info'
import { DataTable } from './data-table'
import { MetricCard } from '@/components/shared/metric-card'
import { PageHeader } from '@/components/shared/page-header'
import { QuotaBar } from '@/components/shared/quota-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { Surface } from '@/components/shared/surface'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { buildDailySeries, type DailyPoint } from '@/lib/analytics'
import { copyToClipboard, formatDate, formatIDRCurrency } from '@/lib/utils'
import { getDashboard, getQuota, type DashboardData, type DashboardOrder, type QuotaData } from '@/services/dashboard'
import { getOrders } from '@/services/orders'
import { getCurrentUser } from '@/services/user'

type DashboardOverviewProps = {
  token: string
}

const SOURCE_SERIES: Record<string, { label: string; color: string }> = {
  telegram: { label: 'Telegram', color: 'hsl(var(--chart-2))' },
  whatsapp: { label: 'WhatsApp', color: 'hsl(var(--chart-1))' },
  website: { label: 'Website', color: 'hsl(var(--chart-4))' },
  api: { label: 'API', color: 'hsl(var(--chart-3))' },
  other: { label: 'Lainnya', color: 'hsl(var(--chart-5))' }
}

const SOURCE_CONFIG = {
  ...Object.fromEntries(
    Object.entries(SOURCE_SERIES).map(([key, series]) => [key, { label: series.label, color: series.color }])
  ),
  value: { label: 'Jumlah' }
} satisfies ChartConfig

const TREND_CONFIG = {
  orders: { label: 'Order', color: 'hsl(var(--chart-1))' }
} satisfies ChartConfig

/** One backend source key → one chart series id, so unknown sources still render. */
function sourceSeriesId(source: string): string {
  const key = source.toLowerCase()
  return key in SOURCE_SERIES ? key : 'other'
}

function buildSourceSeries(breakdown: Record<string, number> | null | undefined) {
  if (!breakdown) return []
  return Object.entries(breakdown)
    .filter(([source, value]) => Number.isFinite(value) && value > 0 && Boolean(source))
    .map(([source, value]) => {
      const id = sourceSeriesId(source)
      return { source: id, value, fill: `var(--color-${id})` }
    })
}

function compactIDR(value: number): string {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)}rb`
  return `Rp${value}`
}

export function DashboardOverview({ token }: DashboardOverviewProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [quota, setQuota] = useState<QuotaData | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  const [trend, setTrend] = useState<DailyPoint[] | null>(null)
  const [isTrendLoading, setIsTrendLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setDashboard(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [data, q, user] = await Promise.all([getDashboard(token), getQuota(token), getCurrentUser(token)])
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

  useEffect(() => {
    if (!token) {
      setTrend(null)
      setIsTrendLoading(false)
      return
    }

    let cancelled = false
    setIsTrendLoading(true)
    getOrders(token, { limit: 100, sortBy: 'createdAt', sortDir: 'desc' })
      .then((res) => {
        if (!cancelled) setTrend(buildDailySeries(res.data, 14))
      })
      .catch(() => {
        if (!cancelled) setTrend(null)
      })
      .finally(() => {
        if (!cancelled) setIsTrendLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const ordersBySource = useMemo(() => {
    if (!dashboard || dashboard.totalOrders <= 0) return null
    const series = buildSourceSeries(dashboard.ordersBySource)
    return series.length ? series : null
  }, [dashboard])

  const revenueBySource = useMemo(() => {
    if (!dashboard || dashboard.totalRevenue <= 0) return null
    const series = buildSourceSeries(dashboard.revenueBySource)
    return series.length ? series : null
  }, [dashboard])

  const recentOrderColumns = useMemo<ColumnDef<DashboardOrder>[]>(
    () => [
      {
        accessorKey: 'orderId',
        header: 'Order',
        cell: ({ row }) => <span className="font-mono text-mono-data">{row.original.orderId}</span>
      },
      {
        accessorKey: 'source',
        header: 'Sumber',
        cell: ({ row }) => <StatusBadge kind="source" value={row.original.source} />
      },
      {
        id: 'customer',
        header: 'Pelanggan',
        cell: ({ row }) => <OrderBuyerInfo order={row.original} variant="cell" />
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge kind="order" value={row.original.status} withDot />
      },
      {
        accessorKey: 'totalPrice',
        header: 'Total',
        cell: ({ row }) => <span className="font-mono text-sm tabular text-right block">{formatIDRCurrency(row.original.totalPrice)}</span>
      },
      {
        accessorKey: 'createdAt',
        header: 'Waktu',
        cell: ({ row }) => <span className="text-caption text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      }
    ],
    []
  )

  const growthHint = useMemo(() => {
    if (!dashboard) return 'belum ada data'
    const sign = dashboard.revenueGrowth > 0 ? '+' : ''
    return `${sign}${dashboard.revenueGrowth}% pertumbuhan pendapatan`
  }, [dashboard])

  const storeUrl = userId && typeof window !== 'undefined' ? `${window.location.origin}/store/${userId}` : ''

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Dashboard"
        title="Ringkasan bisnis"
        description="Pantau produk, order, dan performa pendapatan dari satu tempat."
      />

      <div className="grid gap-4 animate-fade-in-up sm:grid-cols-2 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Surface key={i} className="space-y-3 p-5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-16" />
              </Surface>
            ))
          : (
              <>
                <MetricCard label="Produk aktif" value={dashboard?.activeProducts ?? 0} icon={Boxes} hint="terdaftar di katalog" />
                <MetricCard label="Total order" value={dashboard?.totalOrders ?? 0} icon={ShoppingCart} hint="sepanjang waktu" />
                <MetricCard label="Pending" value={dashboard?.pendingOrders ?? 0} icon={Activity} hint="perlu tindakan" />
                <MetricCard label="Pendapatan" value={formatIDRCurrency(dashboard?.totalRevenue ?? 0)} icon={HandCoins} hint={growthHint} />
                <MetricCard
                  label="Tiket"
                  value={dashboard?.tickets.total ?? 0}
                  icon={TicketCheck}
                  hint={dashboard ? `${dashboard.tickets.open} terbuka · ${dashboard.tickets.closed} selesai` : 'belum ada data'}
                />
              </>
            )}
      </div>

      <div className="grid gap-4 animate-fade-in-up lg:grid-cols-2">
        <Surface className="p-5">
          <h2 className="text-small-header">Order per sumber</h2>
          <p className="text-caption mt-0.5 text-muted-foreground">Bagian order Telegram, WhatsApp, dan website.</p>
          {isLoading ? (
            <Skeleton className="mt-4 h-52" />
          ) : ordersBySource ? (
            <ChartContainer config={SOURCE_CONFIG} className="mt-4 h-52 w-full">
              <PieChart>
                <Pie data={ordersBySource} dataKey="value" nameKey="source" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0} />
                <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
                <ChartLegend content={<ChartLegendContent nameKey="source" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyState
              className="h-52"
              icon={ShoppingCart}
              title="Belum ada order"
              description="Order dari Telegram, WhatsApp, atau toko publik akan muncul di sini."
            />
          )}
        </Surface>

        <Surface className="p-5">
          <h2 className="text-small-header">Pendapatan per sumber</h2>
          <p className="text-caption mt-0.5 text-muted-foreground">Total nilai order yang selesai, dipecah per kanal.</p>
          {isLoading ? (
            <Skeleton className="mt-4 h-52" />
          ) : revenueBySource ? (
            <ChartContainer config={SOURCE_CONFIG} className="mt-4 h-52 w-full">
              <BarChart data={revenueBySource} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" />
                <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 12 }} tickFormatter={(value: string) => SOURCE_SERIES[value]?.label ?? value} />
                <YAxis width={56} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} tickFormatter={(value: number) => compactIDR(value)} />
                <ChartTooltip content={<ChartTooltipContent nameKey="source" formatter={(value) => formatIDRCurrency(Number(value))} />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {revenueBySource.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState
              className="h-52"
              icon={HandCoins}
              title="Belum ada pendapatan"
              description="Pendapatan per sumber muncul setelah ada order selesai."
            />
          )}
        </Surface>
      </div>

      <Surface className="animate-fade-in-up p-5">
        <h2 className="text-small-header">Order per hari</h2>
        <p className="text-caption mt-0.5 text-muted-foreground">Jumlah order yang masuk, 14 hari terakhir.</p>
        {isTrendLoading ? (
          <Skeleton className="mt-4 h-64" />
        ) : trend ? (
          <ChartContainer config={TREND_CONFIG} className="mt-4 h-64 w-full">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} />
              <YAxis allowDecimals={false} width={34} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Area type="monotone" dataKey="orders" stroke="var(--color-orders)" fill="var(--color-orders)" fillOpacity={0.15} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyState
            className="h-64"
            icon={Activity}
            title="Tren gagal dimuat"
            description="Data order 14 hari terakhir tidak tersedia. Muat ulang halaman untuk mencoba lagi."
          />
        )}
      </Surface>

      {userId ? (
        <Surface className="animate-fade-in-up p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-small-header">Tautan toko publik</h2>
              <p className="text-body-sm mt-1 truncate font-mono text-muted-foreground">{storeUrl}</p>
              <p className="text-caption mt-0.5 text-muted-foreground">Bagikan tautan ini agar customer bisa order lewat website.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              disabled={linkCopied}
              onClick={async () => {
                const ok = await copyToClipboard(storeUrl)
                if (!ok) {
                  toast.error('Gagal menyalin tautan. Silakan copy manual.')
                  return
                }
                setLinkCopied(true)
                toast.success('Tautan berhasil disalin')
                setTimeout(() => setLinkCopied(false), 2000)
              }}>
              <Copy className="size-4" />
              {linkCopied ? 'Tersalin' : 'Salin tautan'}
            </Button>
          </div>
        </Surface>
      ) : null}

      {quota ? (
        <Surface className="animate-fade-in-up p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-small-header">Pemakaian paket</h2>
            <p className="text-body-sm font-medium">{quota.plan}</p>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <QuotaBar label="Produk" used={quota.products.used} total={quota.products.total} />
            <QuotaBar label="Template" used={quota.templates.used} total={quota.templates.total} />
            <QuotaBar label="Broadcast/bulan" used={quota.broadcastsPerMonth.used} total={quota.broadcastsPerMonth.total} />
            <QuotaBar label="Order/bulan" used={quota.ordersPerMonth.used} total={quota.ordersPerMonth.total} />
          </div>
        </Surface>
      ) : null}

      <section className="animate-fade-in-up space-y-3">
        <div>
          <h2 className="text-small-header">Order terbaru</h2>
          <p className="text-caption mt-0.5 text-muted-foreground">Order terakhir yang masuk ke sistem.</p>
        </div>
        <DataTable
          columns={recentOrderColumns}
          data={dashboard?.recentOrders ?? []}
          isLoading={isLoading}
          emptyIcon={ShoppingCart}
          emptyMessage="Belum ada order."
          emptyDescription="Order dari Telegram, WhatsApp, atau toko publik akan tampil di sini."
        />
      </section>
    </div>
  )
}
