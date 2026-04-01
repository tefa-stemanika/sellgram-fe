'use client'

import { useEffect, useState } from 'react'
import { Activity, Boxes, HandCoins, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatIDRCurrency } from '@/lib/utils'
import { getOrders, type Order } from '@/services/orders'
import { getProducts, type Product } from '@/services/products'

type DashboardOverviewProps = {
  token: string
}

export function DashboardOverview({ token }: DashboardOverviewProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setProducts([])
        setRecentOrders([])
        return
      }

      try {
        const [productsData, ordersData] = await Promise.all([getProducts(token), getOrders(token, 5)])
        setProducts(productsData)
        setRecentOrders(ordersData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat ringkasan dashboard')
      }
    }

    void fetchData()
  }, [token])

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
      <div className="relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl p-6 transition-all duration-300">
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-3 w-fit rounded-full px-3 py-1 text-xs transition-all duration-200">
              Ringkasan Harian
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau produk, order, dan performa pendapatan secara real-time.
            </p>
          </div>
          <div className="hidden rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl p-2 text-primary sm:block animate-fade-in">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon

          return (
            <Card
              key={metric.title}
              className="overflow-hidden transition-all duration-300 cursor-pointer group bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className={`relative pb-3 transition-all duration-300 group-hover:brightness-110`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <div className="rounded-md p-1.5 text-primary transition-all duration-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="transition-all duration-300 ">
                <p className="text-3xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-300">
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300">
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
                  <TableRow key={order.id} className="transition-all duration-200">
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
