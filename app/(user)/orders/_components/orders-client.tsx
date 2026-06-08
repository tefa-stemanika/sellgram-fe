'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ListFilter, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '../../_components/data-table'
import { getOrderColumns } from './order-columns'
import { OrderDetailDialog } from './order-detail-dialog'
import { getOrders, type Order, type OrderStatus } from '@/services/orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputSearch from '@/components/core/input-search'

type OrdersClientProps = {
  token: string
}

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Payment Failed', value: 'PAYMENT_FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' }
]

const SOURCE_FILTERS = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Telegram', value: 'TELEGRAM' },
  { label: 'Website', value: 'WEBSITE' },
]

export function OrdersClient({ token }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setOrders([])
      return
    }

    setIsLoading(true)
    try {
      const result = await getOrders(token, {
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        source: sourceFilter === 'ALL' ? undefined : sourceFilter
      })
      setOrders(result.data)
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat order')
    } finally {
      setIsLoading(false)
    }
  }, [token, page, search, statusFilter, sourceFilter])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

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
                  {total} order ditemukan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.15s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-emerald-600" />
        <div className="bg-white p-4 dark:bg-card">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputSearch
              placeholder="Cari order..."
              defaultValue={search}
              onChangeValue={(value) => {
                setSearch(value)
                setPage(1)
              }}
              wrapperClassname="flex-1"
              className="bg-white dark:bg-card"
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}>
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-44 transition-all duration-200">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter}
              onValueChange={(value) => {
                setSourceFilter(value)
                setPage(1)
              }}>
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-40 transition-all duration-200">
                <SelectValue placeholder="Filter sumber" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            onRowClick={(order) => setSelectedOrder(order)}
            emptyIcon={PackageOpen}
            emptyMessage="Belum ada order."
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
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
