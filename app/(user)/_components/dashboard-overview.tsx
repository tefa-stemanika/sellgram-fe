'use client'

import { Activity, Boxes, HandCoins, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import type { Order } from '@/services/orders'
import type { Product } from '@/services/products'

type DashboardOverviewProps = {
  products: Product[]
  recentOrders: Order[]
}

export function DashboardOverview({ products, recentOrders }: DashboardOverviewProps) {
  const activeProducts = products.filter((product) => product.isAvailable).length
  const totalOrders = recentOrders.length
  const totalRevenue = recentOrders
    .filter((order) => order.status === 'COMPLETED')
    .reduce((acc, order) => acc + order.totalPrice, 0)

  const metricCards = [
    {
      title: 'Jumlah Produk Aktif',
      value: activeProducts,
      icon: Boxes,
      accent: 'from-primary/20 to-primary/0'
    },
    {
      title: 'Total Order',
      value: totalOrders,
      icon: Activity,
      accent: 'from-accent/20 to-accent/0'
    },
    {
      title: 'Total Pendapatan',
      value: formatIDRCurrency(totalRevenue),
      icon: HandCoins,
      accent: 'from-emerald-400/25 to-emerald-100/10'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.2),transparent_40%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-3 w-fit rounded-full px-3 py-1 text-xs">
              Ringkasan Harian
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau produk, order, dan performa pendapatan secara real-time.
            </p>
          </div>
          <div className="hidden rounded-xl bg-primary/10 p-2 text-primary sm:block">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon

          return (
            <Card key={metric.title} className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
              <CardHeader className={`relative pb-3 bg-gradient-to-br ${metric.accent}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <div className="rounded-md bg-background/80 p-1.5 text-primary shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Order Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.firstName ?? order.username ?? '-'}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell className="text-right">{formatIDRCurrency(order.totalPrice)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Belum ada order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
