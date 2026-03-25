'use client'

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan bisnis dan order terbaru.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Produk Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatIDRCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
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
