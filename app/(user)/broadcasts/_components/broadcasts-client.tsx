'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import InputSearch from '@/components/core/input-search'
import { PageHeader } from '@/components/shared/page-header'
import { Surface } from '@/components/shared/surface'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { statusOptions } from '@/lib/status-tokens'
import {
  getBroadcasts,
  sendBroadcast,
  pauseBroadcast,
  resumeBroadcast,
  cancelBroadcast,
  deleteBroadcast,
} from '@/services/broadcast'
import type { BroadcastCampaign, BroadcastFilters } from '@/schemas/broadcast'

import { DataTable } from '../../_components/data-table'
import { getBroadcastColumns } from './broadcast-columns'

type BroadcastsClientProps = {
  token: string
}

const STATUS_FILTERS = statusOptions('broadcast', 'Semua status')

export function BroadcastsClient({ token }: BroadcastsClientProps) {
  const router = useRouter()
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const fetchBroadcasts = useCallback(async () => {
    if (!token) {
      setBroadcasts([])
      return
    }

    setIsLoading(true)
    try {
      const result = await getBroadcasts(token, {
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : (statusFilter as any),
        sortBy,
        sortDir,
      })
      setBroadcasts(result.data)
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat broadcast')
    } finally {
      setIsLoading(false)
    }
  }, [token, page, statusFilter, sortBy, sortDir])

  useEffect(() => {
    void fetchBroadcasts()
  }, [fetchBroadcasts])

  const handleAction = useCallback(async (broadcast: BroadcastCampaign, action: string) => {
    if (!token) return
    try {
      const actions: Record<string, () => Promise<any>> = {
        send: () => sendBroadcast(token, broadcast.id),
        pause: () => pauseBroadcast(token, broadcast.id),
        resume: () => resumeBroadcast(token, broadcast.id),
        cancel: () => cancelBroadcast(token, broadcast.id),
        delete: () => deleteBroadcast(token, broadcast.id)
      }

      const labels: Record<string, string> = {
        send: 'Broadcast mulai dikirim',
        pause: 'Broadcast dihentikan sementara',
        resume: 'Broadcast dilanjutkan',
        cancel: 'Broadcast dibatalkan',
        delete: 'Broadcast berhasil dihapus'
      }

      await actions[action]()
      toast.success(labels[action] || 'Berhasil')
      void fetchBroadcasts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memproses broadcast')
    }
  }, [token, fetchBroadcasts])

  const handleDetail = useCallback((broadcast: BroadcastCampaign) => {
    router.push(`/broadcasts/${broadcast.id}`)
  }, [router])

  const columns = useMemo(
    () =>
      getBroadcastColumns({
        onAction: handleAction,
        onDetail: handleDetail
      }),
    [handleAction, handleDetail]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Marketing"
        title="Broadcast"
        description="Kirim pesan massal ke pelanggan melalui Telegram bot."
        actions={
          <Button onClick={() => router.push('/broadcasts/create')}>
            <Plus className="h-4 w-4" />
            Buat broadcast
          </Button>
        }
      />

      <Surface className="animate-fade-in-up p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputSearch
            placeholder="Cari broadcast..."
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
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={`${sortBy}:${sortDir}`}
            onValueChange={(value) => {
              const [by, dir] = value.split(':')
              setSortBy(by)
              setSortDir(dir)
              setPage(1)
            }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Terbaru</SelectItem>
              <SelectItem value="createdAt:asc">Terlama</SelectItem>
              <SelectItem value="name:asc">Nama A-Z</SelectItem>
              <SelectItem value="name:desc">Nama Z-A</SelectItem>
              <SelectItem value="status:asc">Status</SelectItem>
              <SelectItem value="totalCustomers:desc">Terbanyak penerima</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Surface>

      <DataTable
        columns={columns}
        data={broadcasts}
        isLoading={isLoading}
        onRowClick={(b) => handleDetail(b)}
        emptyIcon={Megaphone}
        emptyMessage="Belum ada campaign broadcast."
        pagination={{ page, totalPages, onPageChange: setPage, total, totalLabel: 'broadcast' }}
      />
    </div>
  )
}
