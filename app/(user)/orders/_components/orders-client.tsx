'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ListFilter, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '../../_components/data-table'
import { getOrderColumns } from './order-columns'
import { OrderDetailDialog } from './order-detail-dialog'
import { getOrders, type Order, type OrderStatus } from '@/services/orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputSearch from '@/components/core/input-search'
import { PageHeader } from '@/components/shared/page-header'
import { Surface } from '@/components/shared/surface'

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
      <PageHeader
        kicker="Pesanan"
        title="Daftar order"
        description="Pantau dan kelola semua order dari pelanggan."
      />

      <Surface className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ListFilter className="size-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-card-title">Filter order</h2>
            <p className="text-body-sm text-muted-foreground">
              <span className="font-mono text-mono-data tabular text-foreground">{total}</span> order ditemukan
            </p>
          </div>
        </div>
      </Surface>

      <Surface className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputSearch
            placeholder="Cari order..."
            defaultValue={search}
            onChangeValue={(value) => {
              setSearch(value)
              setPage(1)
            }}
            wrapperClassname="flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
            <SelectTrigger className="w-full sm:w-44">
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
            <SelectTrigger className="w-full sm:w-40">
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
      </Surface>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        onRowClick={(order) => setSelectedOrder(order)}
        emptyIcon={PackageOpen}
        emptyMessage="Belum ada order."
        pagination={{ page, totalPages, onPageChange: setPage, total, totalLabel: 'order' }}
      />

      <OrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  )
}
