'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import InputSearch from '@/components/core/input-search'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getBroadcasts,
  sendBroadcast,
  pauseBroadcast,
  resumeBroadcast,
  cancelBroadcast,
  deleteBroadcast,
  createBroadcast,
  previewBroadcast
} from '@/services/broadcast'
import type { BroadcastCampaign, BroadcastFilters } from '@/schemas/broadcast'
import { BROADCAST_STATUSES, getBroadcastStatusLabel } from '@/schemas/broadcast'
import type { CreateBroadcastFormValues } from '@/schemas/broadcast'

import { DataTable } from '../../_components/data-table'
import { getBroadcastColumns } from './broadcast-columns'
import { BroadcastCreateDialog } from './broadcast-create-dialog'

type BroadcastsClientProps = {
  token: string
}

const STATUS_FILTERS = [
  { label: 'Semua Status', value: 'ALL' },
  ...BROADCAST_STATUSES.map((s) => ({
    label: getBroadcastStatusLabel(s),
    value: s,
  })),
]

export function BroadcastsClient({ token }: BroadcastsClientProps) {
  const router = useRouter()
  const [broadcasts, setBroadcasts] = useState<BroadcastCampaign[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewTotal, setPreviewTotal] = useState<number | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  const [isCreateOpen, setIsCreateOpen] = useState(false)

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

  const handleCreate = async (values: CreateBroadcastFormValues & { filters?: BroadcastFilters }) => {
    if (!token) return
    setIsSaving(true)
    try {
      await createBroadcast(token, values)
      toast.success('Broadcast berhasil dibuat')
      setIsCreateOpen(false)
      setPreviewTotal(null)
      void fetchBroadcasts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat broadcast')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = async (filters: BroadcastFilters) => {
    if (!token) return null
    setIsPreviewLoading(true)
    try {
      const result = await previewBroadcast(token, filters)
      setPreviewTotal(result.total)
      return result
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal preview')
      return null
    } finally {
      setIsPreviewLoading(false)
    }
  }

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
      <header className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Broadcast</span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Campaign <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Broadcast</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Kirim pesan massal ke pelanggan melalui Telegram bot.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.1s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="bg-white p-5 dark:bg-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Broadcast</h2>
                <p className="text-sm text-muted-foreground">{total} campaign</p>
              </div>
            </div>
            <Button
              className="shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => {
                setPreviewTotal(null)
                setIsCreateOpen(true)
              }}>
              <Plus className="h-4 w-4" />
              Buat Broadcast
            </Button>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ animation: 'fadeInUp 0.4s ease both', animationDelay: '0.13s' }}>
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
        <div className="bg-white p-4 dark:bg-card">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputSearch
              placeholder="Cari broadcast..."
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
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-40 transition-all duration-200">
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
              <SelectTrigger className="w-full bg-white dark:bg-card sm:w-44 transition-all duration-200">
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

          <DataTable
            columns={columns}
            data={broadcasts}
            isLoading={isLoading}
            onRowClick={(b) => handleDetail(b)}
            emptyIcon={Megaphone}
            emptyMessage="Belum ada campaign broadcast."
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BroadcastCreateDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setPreviewTotal(null)
        }}
        onSubmit={handleCreate}
        onPreview={handlePreview}
        isLoading={isSaving}
        isPreviewLoading={isPreviewLoading}
        previewTotal={previewTotal}
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
