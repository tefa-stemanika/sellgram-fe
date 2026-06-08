'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import InputSearch from '@/components/core/input-search'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  type CreateCustomerPayload,
  type Customer,
  type UpdateCustomerPayload
} from '@/services/customers'

import { DataTable } from '../../_components/data-table'
import { CustomerDetailDialog } from './customer-detail-dialog'
import { getCustomerColumns } from './customer-columns'
import { CustomerFormDialog } from './customer-form-dialog'

type CustomersClientProps = {
  token: string
}

const SOURCE_FILTERS = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Order', value: 'ORDER' },
]

const ORDER_SOURCE_FILTERS = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Telegram', value: 'TELEGRAM' },
  { label: 'Website', value: 'WEBSITE' },
]

export function CustomersClient({ token }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [orderSourceFilter, setOrderSourceFilter] = useState('ALL')

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const fetchCustomers = useCallback(async () => {
    if (!token) {
      setCustomers([])
      return
    }

    setIsLoading(true)
    try {
      const result = await getCustomers(token, {
        page,
        limit: 20,
        search: search || undefined,
        source: sourceFilter === 'ALL' ? undefined : sourceFilter,
        orderSource: orderSourceFilter === 'ALL' ? undefined : orderSourceFilter
      })
      setCustomers(result.data)
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat pelanggan')
    } finally {
      setIsLoading(false)
    }
  }, [token, page, search, sourceFilter, orderSourceFilter])

  useEffect(() => {
    void fetchCustomers()
  }, [fetchCustomers])

  const handleDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleCreate = async (payload: CreateCustomerPayload) => {
    if (!token) return
    setIsSaving(true)
    try {
      await createCustomer(token, payload)
      toast.success('Pelanggan berhasil ditambahkan')
      setIsFormOpen(false)
      setEditingCustomer(null)
      void fetchCustomers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambah pelanggan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (payload: UpdateCustomerPayload) => {
    if (!token || !editingCustomer) return
    setIsSaving(true)
    try {
      await updateCustomer(token, editingCustomer.id, payload)
      toast.success('Pelanggan berhasil diperbarui')
      setIsFormOpen(false)
      setEditingCustomer(null)
      void fetchCustomers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui pelanggan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleted = () => {
    void fetchCustomers()
    setSelectedCustomer(null)
  }

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onDetail: handleDetail
      }),
    []
  )

  return (
    <div className="space-y-6">
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pelanggan
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Daftar{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Pelanggan
          </span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kelola dan pantau semua pelanggan dari bot Anda.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.1s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
        <div className="bg-white p-5 dark:bg-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Pelanggan</h2>
                <p className="text-sm text-muted-foreground">{total} pelanggan terdaftar</p>
              </div>
            </div>
            <Button
              className="shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => {
                setEditingCustomer(null)
                setIsFormOpen(true)
              }}>
              <UserPlus className="h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.13s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="bg-white p-4 dark:bg-card">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputSearch
              placeholder="Cari pelanggan..."
              defaultValue={search}
              onChangeValue={(value) => {
                setSearch(value)
                setPage(1)
              }}
              wrapperClassname="flex-1"
              className="bg-white dark:bg-card"
            />
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
            <Select
              value={orderSourceFilter}
              onValueChange={(value) => {
                setOrderSourceFilter(value)
                setPage(1)
              }}>
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-44 transition-all duration-200">
                <SelectValue placeholder="Filter sumber order" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_SOURCE_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={customers}
            isLoading={isLoading}
            onRowClick={(customer) => handleDetail(customer)}
            emptyIcon={Users}
            emptyMessage="Belum ada pelanggan."
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

      <CustomerDetailDialog
        customer={selectedCustomer}
        token={token}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setSelectedCustomer(null)
        }}
        onDeleted={handleDeleted}
        onEdit={handleEdit}
      />

      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingCustomer(null)
        }}
        onSubmit={(values) => {
          if (editingCustomer) {
            void handleUpdate(values as UpdateCustomerPayload)
          } else {
            void handleCreate(values as CreateCustomerPayload)
          }
        }}
        customer={editingCustomer}
        isLoading={isSaving}
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
