'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ListFilter, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '../../_components/data-table'
import { getOrderColumns } from './order-columns'
import { OrderDetailDialog } from './order-detail-dialog'
import { getOrders, type Order, type OrderStatus } from '@/services/orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OrdersClientProps = {
  token: string
}

const ORDER_FILTERS: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Payment Failed', value: 'PAYMENT_FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' }
]

export function OrdersClient({ token }: OrdersClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const statusParam = searchParams.get('status')
  const statusFilter: OrderStatus | 'ALL' =
    statusParam && ORDER_FILTERS.some((filter) => filter.value === statusParam)
      ? (statusParam as OrderStatus | 'ALL')
      : 'ALL'

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setOrders([])
        return
      }

      setIsLoading(true)
      try {
        const latest = await getOrders(token, 50)
        setOrders(latest)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat orders')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [token])

  const handleStatusChange = (value: OrderStatus | 'ALL') => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (value === 'ALL') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', value)
    }

    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  const columns = useMemo(
    () =>
      getOrderColumns({
        onDetail: (order) => setSelectedOrder(order)
      }),
    []
  )

  return (
    <div className="space-y-6">
      <header
        className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Order
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Daftar <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Order</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pantau dan kelola semua order dari pelanggan.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.1s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-violet-600" />
        <div className="bg-white p-5 dark:bg-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <ListFilter className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Filter Order</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredOrders.length} order ditemukan
                  {statusFilter !== 'ALL' ? ` (filter: ${statusFilter})` : ''}
                </p>
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => handleStatusChange(value as OrderStatus | 'ALL')}>
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-56 transition-all duration-200">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.15s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-emerald-600" />
        <div className="bg-white p-4 dark:bg-card">
          <DataTable
            columns={columns}
            data={filteredOrders}
            isLoading={isLoading}
            onRowClick={(order) => setSelectedOrder(order)}
            emptyIcon={PackageOpen}
            emptyMessage="Belum ada order."
          />
        </div>
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />

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
