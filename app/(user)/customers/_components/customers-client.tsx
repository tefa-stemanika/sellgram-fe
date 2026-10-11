'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Surface } from '@/components/shared/surface'
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
      <PageHeader
        kicker="Pelanggan"
        title="Pelanggan"
        description="Kelola dan pantau semua pelanggan dari bot Anda."
        actions={
          <Button
            onClick={() => {
              setEditingCustomer(null)
              setIsFormOpen(true)
            }}>
            <UserPlus className="h-4 w-4" />
            Tambah pelanggan
          </Button>
        }
      />

      <Surface className="animate-fade-in-up p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputSearch
            placeholder="Cari pelanggan..."
            defaultValue={search}
            onChangeValue={(value) => {
              setSearch(value)
              setPage(1)
            }}
            wrapperClassname="flex-1"
          />
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
          <Select
            value={orderSourceFilter}
            onValueChange={(value) => {
              setOrderSourceFilter(value)
              setPage(1)
            }}>
            <SelectTrigger className="w-full sm:w-44">
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
      </Surface>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        onRowClick={(customer) => handleDetail(customer)}
        emptyIcon={Users}
        emptyMessage="Belum ada pelanggan."
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          total,
          totalLabel: 'pelanggan'
        }}
      />

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
    </div>
  )
}
